'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [terrain, setTerrain] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResultUrl(null)
      setError(null)
      setTerrain('')
    }
  }, [])

  const handleColorize = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get HF Space URL from environment variable
      const hfSpaceUrl = process.env.NEXT_PUBLIC_HF_SPACE_URL || 'http://localhost:7860'
      
      const formData = new FormData()
      formData.append('data', JSON.stringify([selectedFile]))

      // Call Gradio API endpoint
      const response = await axios.post(`${hfSpaceUrl}/api/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data && response.data.data) {
        // Gradio returns base64 or URL
        const [resultImage, resultText] = response.data.data
        
        if (resultImage) {
          // If it's a base64 string
          if (typeof resultImage === 'string' && resultImage.startsWith('data:')) {
            setResultUrl(resultImage)
          } else if (resultImage.url) {
            setResultUrl(`${hfSpaceUrl}/file=${resultImage.path}`)
          }
        }

        if (resultText) {
          // Extract terrain from result text
          const terrainMatch = resultText.match(/Predicted Terrain:\s*(\w+)/i)
          if (terrainMatch) {
            setTerrain(terrainMatch[1])
          }
        }
      }
    } catch (err: any) {
      console.error('Colorization error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to colorize image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🛰️</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SAR Image Colorization</h1>
              <p className="text-sm text-gray-600 mt-1">Terrain-conditioned SAR-to-RGB Translation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">About This Project</h2>
          <p className="text-gray-600 mb-4">
            This system uses a terrain-conditioned UNet + PatchGAN to colorize Synthetic Aperture Radar (SAR) images. 
            A ResNet-34 classifier first predicts the terrain type, then guides the generator to produce realistic RGB colorizations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">108.18</div>
              <div className="text-xs text-gray-600 mt-1">FID Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">19 dB</div>
              <div className="text-xs text-gray-600 mt-1">PSNR</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">0.36</div>
              <div className="text-xs text-gray-600 mt-1">SSIM</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">99.94%</div>
              <div className="text-xs text-gray-600 mt-1">Classifier Acc</div>
            </div>
          </div>
        </div>

        {/* Upload & Results */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📤 Upload SAR Image</h3>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-56 rounded" />
                ) : (
                  <>
                    <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">SAR image (PNG, JPG)</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
            </label>

            <button
              onClick={handleColorize}
              disabled={!selectedFile || loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span>🎨</span>
                  Colorize Image
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🖼️ Colorized Result</h3>
            
            {resultUrl ? (
              <>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img src={resultUrl} alt="Colorized result" className="w-full" />
                </div>
                
                {terrain && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <div className="font-semibold text-gray-800">Predicted Terrain</div>
                        <div className="text-lg text-green-700 uppercase">{terrain}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = resultUrl
                    link.download = 'sar-colorized.png'
                    link.click()
                  }}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  💾 Download Result
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Upload and colorize an image to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Terrain Types Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🌍 Supported Terrain Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🏙️</span>
              <span className="font-medium text-gray-700">Urban</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🌾</span>
              <span className="font-medium text-gray-700">Grassland</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🌱</span>
              <span className="font-medium text-gray-700">Agriculture</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <span className="text-2xl">🏜️</span>
              <span className="font-medium text-gray-700">Barrenland</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">Built with Next.js + Hugging Face Spaces</p>
            <p>Model: UNet + PatchGAN | Classifier: ResNet-34 | Trained on 16K SAR-RGB pairs</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
