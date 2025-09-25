"use client"

import { useState } from "react"
import { ArrowLeft, Upload, Camera, Sparkles, Loader2, CheckCircle, Download, Share2, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function VirtualTryOnPage() {
    const params = useParams()
    const productId = Number.parseInt(params.id)

    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationStep, setGenerationStep] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [progress, setProgress] = useState(0)

    // All products data (same as in your product detail page)
    const allProducts = [
        {
            id: 1,
            title: "Premium Cotton Hoodie",
            brand: "Urban Style",
            price: 4500,
            originalPrice: 5500,
            images: [
                "/products_page/premium_hoodie.jpg",
                "/products_page/premium_hoodie_2.jpg",
                "/products_page/premium_hoodie_3.jpg",
                "/products_page/premium_hoodie_4.jpg",
            ],
            category: "tops",
            sizes: ["S", "M", "L", "XL"],
            colors: ["yellow", "black", "white"],
            rating: 4.8,
            reviews: 124,
        },
        {
            id: 2,
            title: "Vintage Denim Jacket",
            brand: "Street Wear",
            price: 6200,
            images: [
                "/products_page/vintage_denim_jacket.jpg",
                "/products_page/vintage_denim_jacket_2.jpg",
                "/products_page/vintage_denim_jacket_3.jpg",
            ],
            category: "jackets",
            sizes: ["M", "L", "XL"],
            colors: ["blue", "black"],
            rating: 4.6,
            reviews: 89,
        },
        {
            id: 3,
            title: "Casual White Sneakers",
            brand: "Comfort Walk",
            price: 3800,
            images: [
                "/products_page/casual_white_sneakers.jpg",
                "/products_page/casual_white_sneakers_2.jpg",
                "/products_page/casual_white_sneakers_3.jpg",
            ],
            category: "shoes",
            sizes: ["7", "8", "9", "10", "11"],
            colors: ["white", "grey"],
            rating: 4.7,
            reviews: 156,
        },
        {
            id: 4,
            title: "Oversized T-Shirt",
            brand: "Retro Vibes",
            price: 2200,
            images: ["/products_page/oversized_tshirt.jpg"],
            category: "tops",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: ["black", "white", "grey", "yellow"],
            rating: 4.5,
            reviews: 203,
        },
        {
            id: 5,
            title: "Slim Fit Jeans",
            brand: "Elite Fashion",
            price: 5800,
            images: [
                "/products_page/slim_fit_jeans.jpg",
                "/products_page/slim_fit_jeans_2.jpg",
                "/products_page/slim_fit_jeans_3.jpg",
            ],
            category: "bottoms",
            sizes: ["28", "30", "32", "34", "36"],
            colors: ["blue", "black"],
            rating: 4.9,
            reviews: 78,
        },
        {
            id: 6,
            title: "Summer Floral Dress",
            brand: "Chic Styles",
            price: 4200,
            images: [
                "/products_page/summer_floral_dress.jpg",
                "/products_page/summer_floral_dress_2.jpg",
            ],
            category: "dresses",
            sizes: ["XS", "S", "M", "L"],
            colors: ["yellow", "white", "pink"],
            rating: 4.4,
            reviews: 92,
        },
        {
            id: 9,
            title: "Floral Button-Up Shirt",
            brand: "Tropical Wear",
            price: 3500,
            images: [
                "/virtual_tryon/buttonup_shirt.jpg",
            ],
            category: "tops",
            sizes: ["S", "M", "L", "XL"],
            colors: ["white", "multicolor"],
            rating: 4.6,
            reviews: 54,
        },
    ];

    // Find the current product
    const product = allProducts.find((p) => p.id === productId)

    // Fun loading messages for different steps
    const loadingSteps = [
        { message: "Analyzing your photo...", icon: "🔍", duration: 2000 },
        { message: "Detecting body measurements...", icon: "📏", duration: 1500 },
        { message: "Hm, this looks a bit big. Grabbing a smaller size!", icon: "👕", duration: 2000 },
        { message: "Adjusting the shoulders...", icon: "💪", duration: 1800 },
        { message: "Perfect! Making final adjustments...", icon: "✨", duration: 1500 },
        { message: "Adding some style magic...", icon: "🎨", duration: 1200 },
        { message: "Almost done! Polishing the look...", icon: "✨", duration: 1000 },
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

        // Simulate the generation process with fun messages
        for (let i = 0; i < loadingSteps.length; i++) {
            setGenerationStep(i)
            setProgress(((i + 1) / loadingSteps.length) * 100)

            await new Promise((resolve) => setTimeout(resolve, loadingSteps[i].duration))
        }

        // Show final result
        setIsGenerating(false)
        setShowResult(true)
    }

    const resetTryOn = () => {
        setSelectedImage(null)
        setImagePreview(null)
        setIsGenerating(false)
        setGenerationStep(0)
        setShowResult(false)
        setProgress(0)
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
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
                            <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
                        </div>

                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-yellow-600 bg-clip-text text-transparent">
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
                            <p className="text-xl font-bold text-purple-600">PKR {product.price.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {!showResult ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Camera className="w-6 h-6 text-purple-600" />
                                Upload Your Photo
                            </h3>

                            {!imagePreview ? (
                                <div
                                    className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById("imageUpload").click()}
                                >
                                    <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
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
                                        className="w-full glass-button py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Generating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <button class="pill-button">
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    <span class="label">Try It On!</span>
                                                </button>
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
                                <div className="h-80 bg-gradient-to-br from-purple-50 to-yellow-50 rounded-xl flex flex-col items-center justify-center p-8">
                                    <div className="text-center w-full max-w-md">
                                        <div className="text-6xl mb-4 animate-bounce">{loadingSteps[generationStep]?.icon}</div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4 min-h-[4rem] flex items-center justify-center px-4">
                                            {loadingSteps[generationStep]?.message}
                                        </h4>

                                        {/* Progress Bar */}
                                        <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-3 mb-4">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>

                                        {/* Spinning Gears */}
                                        <div className="flex justify-center gap-2 mt-6">
                                            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                                            <Loader2
                                                className="w-4 h-4 animate-spin text-yellow-500"
                                                style={{ animationDirection: "reverse" }}
                                            />
                                            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
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
                                        src={"/virtual_tryon/generated_pic.jpg" || "/placeholder.svg"}
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
                            <button className="glass-button flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Download Result
                            </button>
                            <button className="glass-button flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                Share Result
                            </button>
                            <button
                                onClick={resetTryOn}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Try Again
                            </button>
                        </div>

                        {/* Call to Action */}
                        <div className="text-center mt-8 p-6 bg-gradient-to-r from-purple-50 to-yellow-50 rounded-xl">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Love the look?</h4>
                            <p className="text-gray-600 mb-4">Get this {product.title} delivered to your doorstep!</p>
                            <Link
                                href={`/productDetails/${productId}`}
                                className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Buy Now - PKR {product.price.toLocaleString()}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Tips for Best Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="text-purple-500">📸</span>
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
