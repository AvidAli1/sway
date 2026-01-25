"use client"
import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react"

export default function ProductQuickViewModal({ isOpen, onClose, product, onAddToCart, isAdded }) {
    const [fullProduct, setFullProduct] = useState(product)
    const [loading, setLoading] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [selectedColor, setSelectedColor] = useState(null)
    const [selectedSize, setSelectedSize] = useState(null)

    useEffect(() => {
        if (isOpen && product?.id) {
            setLoading(true)
            setFullProduct(product) // Reset to initial prop
            setCurrentImageIndex(0)
            setSelectedColor(null)
            setSelectedSize(null)

            fetch(`/api/customer/products/${product.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.product) {
                        const p = data.product
                        // Normalize images: use SD versions if available
                        const images = (p.images || []).map(img => img.SD || img.HD || img)
                        // If no images array, use thumbnail or prop image
                        if (images.length === 0 && (p.thumbnail?.SD || product.image)) {
                            images.push(p.thumbnail?.SD || product.image)
                        }

                        setFullProduct({
                            ...p,
                            id: p._id,
                            title: p.name, // Ensure title matches UI expectation (prop uses name/title)
                            brand: p.brand?.name || p.brand || product.brand,
                            // Ensure arrays
                            colors: p.colors || [],
                            sizes: p.sizes || [],
                            images: images,
                            rating: p.ratings || 0 // Map backend ratings to frontend rating
                        })
                    }
                })
                .catch(err => console.error("QuickView fetch error", err))
                .finally(() => setLoading(false))
        }
    }, [isOpen, product])

    if (!isOpen || !product) return null

    // Display logic
    const displayProduct = fullProduct || product
    const images = displayProduct.images && displayProduct.images.length > 0
        ? displayProduct.images
        : [displayProduct.image || "/placeholder.svg"]

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleAddToCart = () => {
        onAddToCart({
            ...displayProduct,
            selectedColor,
            selectedSize
        })
    }

    // Helper for colors
    const getColorClass = (color) => {
        const map = {
            black: "bg-black", white: "bg-white", grey: "bg-gray-500",
            blue: "bg-blue-500", yellow: "bg-yellow-400", brown: "bg-amber-600",
            red: "bg-red-500", pink: "bg-pink-400"
        }
        return map[color.toLowerCase()] || "bg-gray-400"
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col relative animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b z-10 flex-shrink-0">
                    <h3 className="font-bold">Product Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
                    {/* Image Carousel */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative group">
                        <img
                            src={images[currentImageIndex]}
                            alt={displayProduct.title || displayProduct.name}
                            className="w-full h-full object-cover transition-opacity duration-300"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage() }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage() }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-lg">{displayProduct.title || displayProduct.name}</h3>
                            <p className="text-gray-600 text-sm">{typeof displayProduct.brand === 'object' ? displayProduct.brand.name : displayProduct.brand}</p>
                        </div>
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </div>

                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                        {loading ? "Loading details..." : (displayProduct.description || "No description available.")}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">PKR {(displayProduct.price || 0).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-sm ${i < Math.floor(displayProduct.rating || 0) ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                            <span className="text-sm text-gray-600 ml-1">({displayProduct.rating || 0})</span>
                        </div>
                    </div>

                    {/* Colors */}
                    {displayProduct.colors && displayProduct.colors.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Available Colors:</p>
                            <div className="flex gap-2">
                                {displayProduct.colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 border-gray-300 ${getColorClass(color)} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black' : ''} transition-all`}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {displayProduct.sizes && displayProduct.sizes.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">Available Sizes:</p>
                            <div className="flex gap-2 flex-wrap">
                                {displayProduct.sizes.map((size, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedSize === size ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isAdded ? (
                        <button
                            disabled
                            className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium cursor-default"
                        >
                            <Check className="w-5 h-5" />
                            Added to Cart
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
