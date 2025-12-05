# 🛰️ SAR Image Colorization - Free Hosting Guide

## ✅ Best Option: Hugging Face Spaces (100% Free + GPU)

### Why Hugging Face Spaces?
- ✅ **FREE GPU** (T4 GPU included)
- ✅ Persistent URL
- ✅ Easy sharing & embedding
- ✅ Auto-scaling
- ✅ Built for ML models
- ✅ No credit card required

---

## 🚀 Deployment Steps

### 1. Create Hugging Face Account
- Go to https://huggingface.co/join
- Sign up (free account)

### 2. Create a New Space
1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Name: `sar-colorization` (or your choice)
4. License: MIT
5. SDK: **Gradio**
6. Hardware: **CPU basic** (free) or upgrade to **T4 small GPU** (also free!)

### 3. Upload Files to Your Space

**Required files:**
```
your-space/
├── app.py                          # Main Gradio app (already created)
├── requirements_gradio.txt         # Dependencies (already created)
├── README.md                       # Rename README_HF.md to README.md
├── best_generator.pth              # Your trained generator model
└── terrain_classifier_checkpoints/
    └── best_terrain_classifier.pth # Your trained classifier
```

**Upload methods:**

#### Option A: Web UI (easiest)
1. Go to your Space's "Files" tab
2. Click "Add file" → "Upload files"
3. Upload `app.py`, `requirements_gradio.txt`, and rename `README_HF.md` to `README.md`
4. Upload `best_generator.pth` (may take time if large)
5. Create folder `terrain_classifier_checkpoints` and upload classifier

#### Option B: Git (faster for large files)
```powershell
# Install Git LFS for large model files
git lfs install

# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/sar-colorization
cd sar-colorization

# Copy files
cp path/to/SAR/app.py .
cp path/to/SAR/requirements_gradio.txt requirements.txt
cp path/to/SAR/README_HF.md README.md
cp path/to/SAR/best_generator.pth .
mkdir -p terrain_classifier_checkpoints
cp path/to/SAR/terrain_classifier_checkpoints/best_terrain_classifier.pth terrain_classifier_checkpoints/

# Track large files with Git LFS
git lfs track "*.pth"
git add .gitattributes

# Commit and push
git add .
git commit -m "Initial deployment"
git push
```

### 4. Wait for Build
- HF Spaces will automatically install dependencies and launch your app
- Check the "Logs" tab for any errors
- Usually takes 2-5 minutes

### 5. Access Your App
- Your app will be live at: `https://huggingface.co/spaces/YOUR_USERNAME/sar-colorization`
- Share this URL with anyone!

---

## 🔧 Model File Optimization (If Upload Fails)

If your `.pth` files are too large:

### Option 1: Use PyTorch Model Compression
```python
import torch

# Load model
checkpoint = torch.load('best_generator.pth')

# Save with compression
torch.save(checkpoint, 'best_generator.pth', _use_new_zipfile_serialization=True)
```

### Option 2: Use Git LFS (Large File Storage)
```powershell
# In your space directory
git lfs track "*.pth"
git add .gitattributes
git add *.pth
git commit -m "Add model files"
git push
```

### Option 3: Host Models on HF Model Hub
```python
# Upload to HF Model Hub, then load in app.py:
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(
    repo_id="YOUR_USERNAME/sar-models",
    filename="best_generator.pth"
)
generator.load_state_dict(torch.load(model_path))
```

---

## 🎨 Alternative Free Hosting Options

### Option 2: Google Colab + Gradio Share (Temporary)
**Pros:** Free GPU, no setup  
**Cons:** Link expires after 72 hours

```python
# In Colab notebook
!pip install gradio torch torchvision

# Run app.py
import app
app.demo.launch(share=True)  # Gets temporary public URL
```

### Option 3: GitHub Pages + ONNX.js (CPU Only)
**Pros:** Permanent hosting  
**Cons:** No GPU, slower, requires model conversion

1. Convert model to ONNX
2. Use ONNX.js in browser
3. Host on GitHub Pages

---

## 🐛 Troubleshooting

### "Out of memory" error
- Reduce `IMG_SIZE` from 256 to 128 in `app.py`
- Use CPU instead of GPU (free tier should work)

### "Model file not found"
- Check file paths in `app.py`
- Verify files uploaded correctly in Files tab

### "CUDA out of memory"
- Switch Space hardware to "CPU basic" (still free)
- Or request T4 GPU upgrade in Space settings

### Dependencies fail
- Make sure `requirements_gradio.txt` is named `requirements.txt` in your Space
- Check logs for specific package errors

---

## 📊 Expected Performance

| Hardware | Inference Time | Cost |
|----------|---------------|------|
| HF CPU Basic | ~5-10 sec/image | FREE |
| HF T4 GPU | ~1-2 sec/image | FREE |
| Colab Free | ~1-2 sec/image | FREE (temporary) |

---

## 📞 Next Steps

1. **Test locally first:**
   ```powershell
   cd E:\GitHub\SAR
   pip install -r requirements_gradio.txt
   python app.py
   ```
   Open http://localhost:7860

2. **Deploy to HF Spaces** (follow steps above)

3. **Share your Space** - Get permanent public URL!

---

## 🎯 Quick Command Summary

```powershell
# Test locally
python app.py

# Deploy via Git
git clone https://huggingface.co/spaces/YOUR_USERNAME/sar-colorization
cd sar-colorization
cp ../app.py .
cp ../requirements_gradio.txt requirements.txt
git lfs track "*.pth"
git add .
git commit -m "Deploy SAR colorization"
git push
```

Your app will be live at: **https://huggingface.co/spaces/YOUR_USERNAME/sar-colorization**

🎉 **You now have a free, permanent, GPU-powered ML demo!**
