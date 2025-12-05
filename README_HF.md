---
title: SAR Image Colorization
emoji: 🛰️
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
models:
  - custom
---

# SAR Image Colorization

Terrain-conditioned SAR-to-RGB image translation using UNet + PatchGAN.

## Model Architecture
- **Generator**: UNet with terrain conditioning at bottleneck
- **Discriminator**: PatchGAN with terrain injection  
- **Losses**: LSGAN (MSE) + L1 + VGG Perceptual
- **Classifier**: ResNet-34 (99.94% accuracy)

## Performance Metrics
- FID: 108.18
- PSNR: 19 dB
- SSIM: 0.36
- Inception Score: 3.07

## Training Details
- 16,000 SAR-RGB image pairs
- 4 terrain types: urban, grassland, agriculture, barrenland
- Trained within 1.5GB VRAM limit using mixed precision

## Usage
Upload a SAR image and the model will:
1. Predict the terrain type (ResNet-34 classifier)
2. Generate a colorized RGB image (conditional UNet generator)

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
