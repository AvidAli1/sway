"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Camera, Sparkles, Loader2, CheckCircle, Download, Share2, RotateCcw, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function VirtualTryOnPage() {
    const params = useParams()
    const productId = params.id

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [generatedImage, setGeneratedImage] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStep, setGenerationStep] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/customer/products/${productId}`)
                const data = await res.json()
                if (data.success) {
                    // Normalize images
                    const p = data.product
                    const images = (p.images || []).map((img) => img.SD || img.HD || img)
                    setProduct({
                        ...p,
                        id: p._id,
                        images,
                        price: p.price || 0,
                        title: p.name || "Product",
                        brand: p.brand?.name || p.brand || "Brand"
                    })
                } else {
                    setError("Product not found")
                }
            } catch (err) {
                console.error("Error fetching product:", err)
                setError("Failed to load product")
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            fetchProduct()
        }
    }, [productId])

    // Fun loading messages for different steps
    const loadingSteps = [
        { message: "Analyzing your photo...", icon: "🔍" },
        { message: "Detecting body measurements...", icon: "📏" },
        { message: "Hm, this looks a bit big. Grabbing a smaller size!", icon: "👕" },
        { message: "Adjusting the shoulders...", icon: "💪" },
        { message: "Perfect! Making final adjustments...", icon: "✨" },
        { message: "Adding some style magic...", icon: "🎨" },
        { message: "Almost done! Polishing the look...", icon: "✨" },
    ]

    const handleImageUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const startVirtualTryOn = async () => {
        if (!selectedImage) return

        setIsGenerating(true)
        setGenerationStep(0)
        setProgress(0)
        setShowResult(false)
        setGeneratedImage(null)

        try {
            // 1. Prepare Garment Image URL
            const vtonImageObj = product.virtualTryOnImage || {}
            // Prefer HD, fallback to SD, fallback to main image if absolutely necessary (though VTON image is preferred)
            const garmentUrl = vtonImageObj.HD || vtonImageObj.SD || (typeof vtonImageObj === 'string' ? vtonImageObj : null)

            if (!garmentUrl) {
                alert("Virtual Try-On Image not found for this product. Please choose a supported product.")
                setIsGenerating(false)
                return
            }

            // 2. Fetch Garment Blob using server proxy to bypass CORS
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(garmentUrl)}`
            const garmentRes = await fetch(proxyUrl)
            if (!garmentRes.ok) {
                throw new Error("Failed to fetch garment image via proxy")
            }
            const garmentBlob = await garmentRes.blob()

            // 3. Map Apparel Type
            let apparelType = 'shirt' // default
            const title = (product.title || '').toLowerCase()
            const cat = (product.category || '').toLowerCase()
            const subCat = (product.subCategory || '').toLowerCase()
            const searchString = `${title} ${cat} ${subCat}`

            if (searchString.includes('dress') || searchString.includes('frock') || searchString.includes('gown') || searchString.includes('maxi')) {
                apparelType = 'dress'
            } else if (searchString.includes('pant') || searchString.includes('jean') || searchString.includes('trouser') || searchString.includes('short') || searchString.includes('bottom') || searchString.includes('skirt')) {
                apparelType = 'pants'
            } else if (searchString.includes('shirt') || searchString.includes('top') || searchString.includes('tee') || searchString.includes('hoodie') || searchString.includes('jacket') || searchString.includes('sweater') || searchString.includes('coat') || searchString.includes('upper')) {
                apparelType = 'shirt'
            }

            // 4. Prepare FormData
            const fd = new FormData()
            fd.append('human_image', selectedImage)
            fd.append('garment_image', garmentBlob, 'garment.jpg')
            fd.append('apparel_type', apparelType)

            // 5. Start Progress Animation Loop using intervals (fakes a ~40s load)
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    const increment = Math.random() * 3 + 1 // random jump between 1 and 4 %
                    const newProgress = Math.min(95, prev + increment) // cap at 95% until complete

                    // Match step message based on progress bracket
                    const stepIndex = Math.min(
                        loadingSteps.length - 1,
                        Math.floor((newProgress / 100) * loadingSteps.length)
                    )
                    setGenerationStep(stepIndex)

                    return newProgress
                })
            }, 1200)

            // 6. Call API
            const response = await fetch('https://nonincorporated-unchristian-leisa.ngrok-free.dev/generate-vton', {
                method: 'POST',
                body: fd,
            })

            const data = await response.json()
            clearInterval(progressInterval)

            if (data.status === 'success' && data.result_url) {
                setProgress(100)
                setGeneratedImage(data.result_url)
                setShowResult(true)
            } else {
                throw new Error(data.message || "Failed to generate image")
            }

        } catch (err) {
            console.error(err)
            alert("Failed to generate V-TON result: " + (err.message || "Unknown error"))
        } finally {
            setIsGenerating(false)
        }
    }

    const resetTryOn = () => {
        setSelectedImage(null)
        setImagePreview(null)
        setGeneratedImage(null)
        setIsGenerating(false)
        setGenerationStep(0)
        setShowResult(false)
        setProgress(0)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b h-16 w-full animate-pulse"></header>
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse flex-1">
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex items-center gap-6 border border-gray-100">
                        <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                        <div className="space-y-3 flex-1 max-w-sm">
                            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            <div className="h-5 w-1/3 bg-gray-200 rounded pt-2"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-96">
                            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
                            <div className="h-full w-full bg-gray-100 rounded-xl"></div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-96">
                            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
                            <div className="h-full w-full bg-gray-100 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <Link href={`/productDetails/${productId}`} className="text-yellow-600 hover:text-yellow-700">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-6">
                            <Link
                                href={`/productDetails/${productId}`}
                                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:block font-medium">Back to Product</span>
                            </Link>
                            <Link href="/">
                                <img src="/logo.png" alt="SWAY Logo" className="h-[24px] w-auto" />
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-yellow-500" />
                            <h1 className="text-lg font-bold text-black">
                                Virtual Try-On
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Product Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-6">
                        <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            className="w-24 h-24 object-cover rounded-xl"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
                            <p className="text-gray-600 mb-2">{product.brand}</p>
                            <p className="text-xl font-bold text-gray-900">PKR {product.price.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {!showResult ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Camera className="w-6 h-6 text-yellow-500" />
                                Upload Your Photo
                            </h3>

                            {!imagePreview ? (
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-gray-50"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById("imageUpload").click()}
                                >
                                    <Upload className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Drop your photo here</h4>
                                    <p className="text-gray-500 mb-4">or click to browse</p>
                                    <p className="text-sm text-gray-400">Supports JPG, PNG, WEBP (Max 10MB)</p>
                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <img
                                            src={imagePreview || "/placeholder.svg"}
                                            alt="Your photo"
                                            className="w-full h-80 object-contain rounded-xl"
                                        />
                                        <button
                                            onClick={resetTryOn}
                                            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={startVirtualTryOn}
                                        disabled={isGenerating}
                                        className="w-full bg-yellow-400 text-black py-4 rounded-xl text-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Generating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Try It On!
                                            </div>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Preview/Loading Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Preview</h3>

                            {!isGenerating && !imagePreview && (
                                <div className="h-80 bg-gray-50 rounded-xl flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Upload your photo to see the magic!</p>
                                    </div>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="h-80 bg-gray-50 rounded-xl flex flex-col items-center justify-center p-8 border border-gray-100">
                                    <div className="text-center w-full max-w-md">
                                        <div className="text-6xl mb-4 animate-bounce">{loadingSteps[generationStep]?.icon}</div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4 min-h-[4rem] flex items-center justify-center px-4">
                                            {loadingSteps[generationStep]?.message}
                                        </h4>

                                        {/* Progress Bar */}
                                        <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-3 mb-4">
                                            <div
                                                className="bg-yellow-400 h-3 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>

                                        {/* Spinning Gears */}
                                        <div className="flex justify-center gap-2 mt-6">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
                                            <Loader2
                                                className="w-4 h-4 animate-spin text-yellow-500"
                                                style={{ animationDirection: "reverse" }}
                                            />
                                            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isGenerating && imagePreview && !showResult && (
                                <div className="h-80 bg-gray-50 rounded-xl flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Ready to try on {product.title}!</p>
                                        <p className="text-sm mt-2">Click "Try It On!" to start</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Result Section */
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Virtual Try-On Complete!</h3>
                            </div>
                            <p className="text-gray-600">Here's how you look in the {product.title}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Original Photo */}
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-gray-700 mb-4">Your Original Photo</h4>
                                <img
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="Original"
                                    className="w-full h-80 object-contain rounded-xl shadow-lg"
                                />
                            </div>

                            {/* Virtual Try-On Result */}
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-gray-700 mb-4">With {product.title}</h4>
                                <div className="relative">
                                    <img
                                        src={generatedImage ? `/api/proxy-image?url=${encodeURIComponent(generatedImage)}` : "/placeholder.svg"}
                                        alt="Virtual Try-On Result"
                                        className="w-full h-80 object-contain rounded-xl shadow-lg"
                                    />
                                    {/* Overlay to show it's a demo
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-xl flex items-end justify-center pb-4">
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            Demo Result
                                        </span>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                            <button className="bg-gray-100 text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" />
                                Download Result
                            </button>
                            <button className="bg-gray-100 text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <Share2 className="w-5 h-5" />
                                Share Result
                            </button>
                            <button
                                onClick={resetTryOn}
                                className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Try Again
                            </button>
                        </div>

                        {/* Call to Action */}
                        <div className="text-center mt-8 p-6 bg-yellow-50 border border-yellow-100 rounded-xl">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Love the look?</h4>
                            <p className="text-gray-600 mb-4">Get this {product.title} delivered to your doorstep!</p>
                            <Link
                                href={`/productDetails/${productId}`}
                                className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-all inline-flex items-center gap-2 shadow-sm"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Buy Now - PKR {product.price.toLocaleString()}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Tips for Best Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-500">📸</span>
                            <p>Use a clear, well-lit photo facing the camera</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-500">👤</span>
                            <p>Make sure your full body is visible in the frame</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-green-500">✨</span>
                            <p>Avoid busy backgrounds for better results</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
