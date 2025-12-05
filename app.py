import gradio as gr
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import torchvision.transforms as transforms
import numpy as np
import os

# Configuration
IMG_SIZE = 256
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
TERRAIN_TYPES = ['urban', 'grassland', 'agri', 'barrenland']

# Model classes
class UNetBlock(nn.Module):
    def __init__(self, in_ch, out_ch, down=True, use_bn=True, use_dropout=False):
        super().__init__()
        self.down = down
        self.use_bn = use_bn
        self.use_dropout = use_dropout
        if down:
            self.conv = nn.Conv2d(in_ch, out_ch, 4, 2, 1, bias=False)
        else:
            self.conv = nn.ConvTranspose2d(in_ch, out_ch, 4, 2, 1, bias=False)
        self.bn = nn.BatchNorm2d(out_ch) if use_bn else nn.Identity()
        self.dropout = nn.Dropout(0.5) if use_dropout else nn.Identity()
        self.act = nn.LeakyReLU(0.2, inplace=True) if down else nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.conv(x)
        x = self.bn(x)
        x = self.dropout(x)
        x = self.act(x)
        return x

class TerrainEncoder(nn.Module):
    def __init__(self, terrain_dim, out_dim):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(terrain_dim, 64),
            nn.ReLU(),
            nn.Linear(64, out_dim),
            nn.ReLU()
        )
    def forward(self, terrain):
        return self.fc(terrain).unsqueeze(2).unsqueeze(3)

class Generator(nn.Module):
    def __init__(self, terrain_dim=len(TERRAIN_TYPES)):
        super().__init__()
        # Encoder
        self.enc1 = UNetBlock(3, 64, down=True, use_bn=False)
        self.enc2 = UNetBlock(64, 128, down=True)
        self.enc3 = UNetBlock(128, 256, down=True)
        self.enc4 = UNetBlock(256, 512, down=True)
        # Terrain
        self.terrain_enc = TerrainEncoder(terrain_dim, 512)
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(512, 512, 3, 1, 1),
            nn.ReLU(inplace=True)
        )
        # Decoder
        self.dec4 = UNetBlock(1024, 256, down=False)
        self.dec3 = UNetBlock(512, 128, down=False)
        self.dec2 = UNetBlock(256, 64, down=False)
        self.dec1 = nn.ConvTranspose2d(128, 3, 4, 2, 1)
        self.tanh = nn.Tanh()

    def forward(self, x, terrain):
        e1 = self.enc1(x)
        e2 = self.enc2(e1)
        e3 = self.enc3(e2)
        e4 = self.enc4(e3)
        t = self.terrain_enc(terrain)
        b = self.bottleneck(e4 + t)
        d4 = self.dec4(torch.cat([b, e4], 1))
        d3 = self.dec3(torch.cat([d4, e3], 1))
        d2 = self.dec2(torch.cat([d3, e2], 1))
        d1 = self.dec1(torch.cat([d2, e1], 1))
        return self.tanh(d1)

class TerrainClassifier(nn.Module):
    def __init__(self, num_classes=len(TERRAIN_TYPES)):
        super().__init__()
        from torchvision import models
        from torchvision.models import ResNet34_Weights
        self.backbone = models.resnet34(weights=None)
        self.backbone.fc = nn.Linear(self.backbone.fc.in_features, num_classes)
        self.dropout = nn.Dropout(0.4)
        
    def forward(self, x):
        x = self.backbone.conv1(x)
        x = self.backbone.bn1(x)
        x = self.backbone.relu(x)
        x = self.backbone.maxpool(x)
        x = self.backbone.layer1(x)
        x = self.backbone.layer2(x)
        x = self.backbone.layer3(x)
        x = self.backbone.layer4(x)
        x = self.backbone.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        x = self.backbone.fc(x)
        return x

# Transform for input images
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3)
])

# Load models
@torch.no_grad()
def load_models():
    try:
        # Load Generator
        generator = Generator().to(DEVICE)
        gen_path = 'best_generator.pth'
        if os.path.exists(gen_path):
            generator.load_state_dict(torch.load(gen_path, map_location=DEVICE, weights_only=True))
            generator.eval()
            print("✅ Generator loaded successfully")
        else:
            print(f"⚠️ Generator file not found: {gen_path}")
        
        # Load TerrainClassifier
        terrain_classifier = TerrainClassifier().to(DEVICE)
        classifier_path = 'terrain_classifier_checkpoints/best_terrain_classifier.pth'
        if os.path.exists(classifier_path):
            terrain_classifier.load_state_dict(torch.load(classifier_path, map_location=DEVICE, weights_only=True))
            terrain_classifier.eval()
            print("✅ Terrain classifier loaded successfully")
        else:
            print(f"⚠️ Classifier file not found: {classifier_path}")
        
        return generator, terrain_classifier
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return None, None

generator, terrain_classifier = load_models()

def predict_terrain(model, sar_input):
    """Predict terrain class from SAR image"""
    with torch.no_grad():
        logits = model(sar_input)
        pred_class = torch.argmax(logits, dim=1)
        # Convert to one-hot encoded terrain vector
        terrain_onehot = torch.zeros(pred_class.size(0), len(TERRAIN_TYPES), device=DEVICE)
        for i, pred in enumerate(pred_class):
            terrain_onehot[i, pred] = 1.0
        # Get terrain name for display
        terrain_name = TERRAIN_TYPES[pred_class[0].item()]
    return terrain_onehot, terrain_name

def colorize_sar(image):
    """Main function for Gradio interface"""
    if generator is None or terrain_classifier is None:
        return None, "❌ Models not loaded. Please check model files."
    
    try:
        # Convert to PIL if needed
        if not isinstance(image, Image.Image):
            image = Image.fromarray(image.astype('uint8'), 'RGB')
        
        # Process image
        img_rgb = image.convert('RGB')
        sar_tensor = transform(img_rgb).unsqueeze(0).to(DEVICE)
        
        # Get terrain prediction
        terrain_onehot, terrain_name = predict_terrain(terrain_classifier, sar_tensor)
        
        # Generate colorized image
        with torch.no_grad():
            fake = generator(sar_tensor, terrain_onehot)
        
        # Convert to numpy for display
        colorized_np = ((fake[0].cpu().numpy().transpose(1, 2, 0) + 1) / 2).clip(0, 1)
        colorized_uint8 = (colorized_np * 255).astype(np.uint8)
        
        result_text = f"🎯 **Predicted Terrain:** {terrain_name.upper()}\n\n✨ Successfully colorized SAR image!"
        
        return Image.fromarray(colorized_uint8), result_text
        
    except Exception as e:
        return None, f"❌ Error: {str(e)}"

# Gradio Interface
with gr.Blocks() as demo:
    gr.Markdown("""
    # 🛰️ SAR Image Colorization
    
    ### Terrain-Conditioned SAR-to-RGB Translation using UNet + PatchGAN
    
    Upload a SAR (Synthetic Aperture Radar) image to colorize it using our trained conditional GAN model.
    The model first predicts the terrain type (urban, grassland, agriculture, barren) and then generates a realistic RGB colorization.
    
    **Model Details:**
    - Generator: UNet with terrain conditioning at bottleneck
    - Discriminator: PatchGAN with terrain injection
    - Losses: LSGAN (MSE) + L1 + VGG Perceptual
    - Metrics: FID: 108.18, PSNR: 19 dB, SSIM: 0.36, IS: 3.07
    - Classifier Accuracy: 99.94% on 16K SAR-RGB pairs
    """)
    
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(label="📤 Upload SAR Image", type="numpy")
            colorize_btn = gr.Button("🎨 Colorize", variant="primary", size="lg")
        
        with gr.Column():
            output_image = gr.Image(label="🖼️ Colorized Output")
            output_text = gr.Textbox(label="📊 Results", lines=3)
    
    gr.Markdown("""
    ### 📝 Example SAR Images
    Try uploading one of your SAR images to see the colorization in action!
    
    **Supported terrain types:** Urban, Grassland, Agriculture, Barrenland
    """)
    
    colorize_btn.click(
        fn=colorize_sar,
        inputs=input_image,
        outputs=[output_image, output_text]
    )
    
    gr.Markdown("""
    ---
    **Note:** This is a research prototype. Model performance depends on image quality and terrain similarity to training data.
    """)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
