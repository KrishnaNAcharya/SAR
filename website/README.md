# SAR Image Colorization - Web Frontend

Modern Next.js frontend that calls your Hugging Face Space API for SAR image colorization.

## 🚀 Quick Deploy to Vercel (Free)

### Option 1: One-Click Deploy
1. Push this `website/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Set environment variable:
   - Key: `NEXT_PUBLIC_HF_SPACE_URL`
   - Value: `https://YOUR_USERNAME-sar-colorization.hf.space`
6. Click Deploy

### Option 2: Vercel CLI
```bash
npm install -g vercel
cd website
npm install
vercel
```

## 🛠️ Local Development

```bash
cd website
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local and add your HF Space URL

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Setup Steps

### 1. Deploy Backend (Hugging Face Space)
First, deploy your model to HF Spaces (see main DEPLOYMENT_GUIDE.md):
```powershell
cd ..
.\deploy_to_hf.ps1 -username YOUR_USERNAME -spacename sar-colorization
```

Your Space will be at: `https://YOUR_USERNAME-sar-colorization.hf.space`

### 2. Configure Frontend
Create `.env.local`:
```env
NEXT_PUBLIC_HF_SPACE_URL=https://YOUR_USERNAME-sar-colorization.hf.space
```

### 3. Deploy Frontend to Vercel
```bash
npm install -g vercel
vercel
```

Follow prompts and set the environment variable when asked.

## 🌐 Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser   │────────▶│  Vercel (Free)   │────────▶│ HF Space    │
│             │         │  Next.js App     │  API    │ (Free GPU)  │
│             │◀────────│                  │◀────────│ Model       │
└─────────────┘         └──────────────────┘         └─────────────┘
```

**Why this setup?**
- ✅ Frontend on Vercel: Free, fast CDN, auto-scaling
- ✅ Backend on HF Spaces: Free GPU, handles ML inference
- ✅ Separation of concerns: Web UI separate from ML model
- ✅ Easy updates: Update model without redeploying frontend

## 🎨 Features

- 📤 Drag & drop image upload
- 🎯 Real-time terrain prediction
- 🖼️ Side-by-side comparison
- 💾 Download colorized results
- 📱 Responsive design (mobile-friendly)
- ⚡ Fast loading with Next.js
- 🎨 Beautiful UI with Tailwind CSS

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    },
  },
}
```

### Add Features
Edit `app/page.tsx` to add:
- Batch processing
- Comparison slider
- Image gallery
- User authentication

## 💰 Cost

| Service | Cost |
|---------|------|
| Vercel (Frontend) | FREE |
| HF Spaces (Backend) | FREE |
| **Total** | **$0.00** 🎉 |

## 🐛 Troubleshooting

### CORS Errors
If you get CORS errors, update your Gradio app to allow CORS:

In your HF Space's `app.py`:
```python
demo.launch(allowed_paths=["/"], share=False)
```

### API Not Working
1. Check your HF Space is running (visit the URL)
2. Verify environment variable is set correctly
3. Check browser console for errors

### Build Fails on Vercel
1. Make sure all dependencies are in `package.json`
2. Check Node.js version compatibility
3. Review Vercel build logs

## 📞 Support

- Frontend issues: Check this README
- Backend (model) issues: See main DEPLOYMENT_GUIDE.md
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs

## 🎯 Next Steps

After deploying:
1. Share your Vercel URL: `https://your-app.vercel.app`
2. Add custom domain (optional)
3. Monitor usage in Vercel dashboard
4. Add analytics (Google Analytics, Plausible)

## 📊 Performance

- First load: ~1-2s
- Inference: ~2-5s (depends on HF Space GPU)
- CDN cached: <500ms

---

**Your frontend will be live at:**
`https://your-app.vercel.app`

**Backend API at:**
`https://YOUR_USERNAME-sar-colorization.hf.space`

🚀 **Both 100% free, forever!**
