# 🌐 Website Deployment Guide

Deploy your SAR colorization as a professional website with **Vercel frontend** + **Hugging Face backend**.

## 🎯 Architecture

```
User's Browser
     ↓
Vercel (Free) ← Modern Next.js Website
     ↓ (API calls)
HF Spaces (Free GPU) ← Your ML Model
```

**Why this setup?**
- Frontend: Fast, global CDN, auto-scaling (Vercel)
- Backend: GPU inference, model hosting (HF Spaces)
- Both: 100% free, no credit card needed

---

## 🚀 Deploy in 5 Steps (10 minutes)

### Step 1: Deploy Backend to Hugging Face (if not done)
```powershell
cd E:\GitHub\SAR
.\deploy_to_hf.ps1 -username YOUR_USERNAME -spacename sar-colorization
```

Wait for Space to build. Note your Space URL:
`https://YOUR_USERNAME-sar-colorization.hf.space`

### Step 2: Test Your HF Space
1. Visit your Space URL
2. Upload a test image
3. Verify colorization works

### Step 3: Prepare Frontend
```powershell
cd website

# Install dependencies
npm install

# Create environment file
Copy-Item .env.local.example .env.local

# Edit .env.local and add your HF Space URL
notepad .env.local
```

In `.env.local`, set:
```env
NEXT_PUBLIC_HF_SPACE_URL=https://YOUR_USERNAME-sar-colorization.hf.space
```

### Step 4: Test Locally
```powershell
npm run dev
```

Open http://localhost:3000 and test the upload/colorize flow.

### Step 5: Deploy to Vercel

#### Option A: GitHub + Vercel (Recommended)
1. Create a new GitHub repo for the website
2. Push the `website/` folder:
   ```powershell
   cd website
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/sar-web.git
   git push -u origin main
   ```

3. Go to [vercel.com](https://vercel.com)
4. Sign up (free, use GitHub)
5. Click "New Project"
6. Import your GitHub repo
7. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (or `website/` if you pushed the whole SAR repo)
   - Environment Variables:
     - Key: `NEXT_PUBLIC_HF_SPACE_URL`
     - Value: `https://YOUR_USERNAME-sar-colorization.hf.space`
8. Click "Deploy"

#### Option B: Vercel CLI (Faster)
```powershell
# Install Vercel CLI
npm install -g vercel

cd website

# Login and deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? sar-colorization-web
# - Directory? ./
# - Override settings? No

# Set environment variable
vercel env add NEXT_PUBLIC_HF_SPACE_URL
# Paste: https://YOUR_USERNAME-sar-colorization.hf.space

# Deploy to production
vercel --prod
```

---

## ✅ Verification

After deployment:

1. **Visit your Vercel URL**: `https://sar-colorization-web.vercel.app`
2. **Upload test image**
3. **Verify**:
   - Image uploads
   - Loading spinner shows
   - Result appears
   - Terrain prediction displays
   - Download button works

---

## 🎨 Customization

### Add Your Branding

Edit `website/app/page.tsx`:
```typescript
// Change title
<h1 className="text-3xl font-bold text-gray-900">Your Name's SAR Colorizer</h1>

// Add your info
<p className="text-sm text-gray-600 mt-1">Your university/company</p>
```

### Change Colors

Edit `website/tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#your-hex-color',
      secondary: '#your-hex-color',
    },
  },
}
```

### Add Custom Domain (Optional, Free)

1. Buy domain from Namecheap/GoDaddy (~$10/year)
2. In Vercel dashboard → Settings → Domains
3. Add domain and follow DNS instructions
4. Your site: `https://sar-colorizer.com`

---

## 🐛 Common Issues

### Issue: CORS Error
**Symptom**: "Access to fetch blocked by CORS policy"

**Fix**: Update your HF Space's `app.py`:
```python
demo.launch(server_name="0.0.0.0", server_port=7860)
```

Redeploy HF Space.

### Issue: API Not Found (404)
**Symptom**: "Failed to fetch" or 404 errors

**Fix**: 
1. Verify HF Space URL is correct in `.env.local`
2. Test HF Space directly in browser
3. Check Space logs for errors

### Issue: Vercel Build Fails
**Fix**:
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build

# If successful, push and redeploy
git add .
git commit -m "Fix build"
git push
```

### Issue: Environment Variable Not Working
**Fix**:
1. Vercel dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_HF_SPACE_URL`
3. Redeploy: Deployments → Latest → "Redeploy"

---

## 💰 Cost Breakdown

| Service | Features | Cost |
|---------|----------|------|
| **Vercel** | Hosting, CDN, SSL | FREE |
| **HF Spaces** | GPU, ML inference | FREE |
| **Domain** (optional) | Custom URL | $10-15/year |
| **Total** | | **$0-15/year** |

Both Vercel and HF Spaces free tiers are permanent and generous for personal projects.

---

## 📊 Performance Expectations

- **Website load**: <1s (Next.js + Vercel CDN)
- **Image upload**: <500ms
- **ML inference**: 2-5s (HF Space GPU)
- **Result display**: <500ms
- **Total user experience**: ~3-6s per image

---

## 🎯 Optional Enhancements

### Add Analytics
```powershell
npm install @vercel/analytics

# In app/layout.tsx:
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Add Image Comparison Slider
```powershell
npm install react-compare-image
```

### Add Multiple Uploads
Edit `app/page.tsx` to accept array of files.

### Add User Accounts
Use [Clerk](https://clerk.com) or [NextAuth](https://next-auth.js.org) (both have free tiers).

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **HF Spaces API**: https://huggingface.co/docs/hub/spaces-sdks-gradio

---

## 🎉 Success Checklist

- [ ] HF Space deployed and working
- [ ] Frontend tested locally
- [ ] Environment variable configured
- [ ] Deployed to Vercel
- [ ] Website loads and works
- [ ] Shared URL with friends/professors
- [ ] (Optional) Added custom domain
- [ ] (Optional) Added to portfolio/resume

---

## 🚀 Final URLs

**Backend (HF Space)**:
`https://YOUR_USERNAME-sar-colorization.hf.space`

**Frontend (Vercel)**:
`https://sar-colorization-web.vercel.app` (or your custom domain)

---

## 💡 Pro Tips

1. **Test backend first**: Always verify HF Space works before debugging frontend
2. **Use Vercel preview deploys**: Every git push creates a preview URL for testing
3. **Monitor usage**: Check Vercel Analytics to see how many people use your app
4. **Add examples**: Put sample SAR images on the page so users can try quickly
5. **Mobile-first**: The site is responsive, test on phone to verify

---

**Your professional ML demo is now live on the internet, with zero hosting costs! 🎉**

Share your Vercel URL and impress everyone! 🚀
