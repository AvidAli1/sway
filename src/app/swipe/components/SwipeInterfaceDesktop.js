"use client"

import { useState, useRef } from "react"
import { Heart, ShoppingCart, ArrowUp, ArrowRight, X, ArrowLeft, ShoppingBag, Star } from "lucide-react"

export default function SwipeInterfaceDesktop({ products, onAddToCart, onAddToBucket }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const cardRef = useRef(null)
    const startPos = useRef({ x: 0, y: 0 })

    const currentProduct = products[currentIndex]

    // If no more products, show end state
    if (!currentProduct) {
        return (
            <div className="text-center py-16 h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No more products!</h3>
                <p className="text-gray-600">You've seen all available products.</p>
            </div>
        )
    }

    const handleTouchStart = (e) => {
        if (isAnimating) return
        setIsDragging(true)
        const touch = e.touches[0]
        startPos.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchMove = (e) => {
        if (!isDragging || isAnimating) return
        const touch = e.touches[0]
        const deltaX = touch.clientX - startPos.current.x
        const deltaY = touch.clientY - startPos.current.y
        setDragOffset({ x: deltaX, y: deltaY })
    }

    const handleTouchEnd = () => {
        if (!isDragging || isAnimating) return
        setIsDragging(false)

        const threshold = 100
        const { x, y } = dragOffset

        // Priority: Up (Cart), Right (Bucket), Left (Pass)
        if (y < -threshold && Math.abs(x) < Math.abs(y)) {
            handleSwipeUp()
        } else if (x > threshold) {
            handleSwipeRight()
        } else if (x < -threshold) {
            handleSwipeLeft()
        } else {
            setDragOffset({ x: 0, y: 0 })
        }
    }

    const handleSwipeUp = () => {
        setIsAnimating(true)
        setDragOffset({ x: 0, y: -1000 })
        onAddToCart(currentProduct)
        setTimeout(() => nextProduct(), 300)
    }

    const handleSwipeRight = () => {
        setIsAnimating(true)
        setDragOffset({ x: 1000, y: 0 })
        onAddToBucket(currentProduct)
        setTimeout(() => nextProduct(), 300)
    }

    const handleSwipeLeft = () => {
        setIsAnimating(true)
        setDragOffset({ x: -1000, y: 0 })
        setTimeout(() => nextProduct(), 300)
    }

    const nextProduct = () => {
        if (currentIndex < products.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            setCurrentIndex(0) // Loop
        }
        setDragOffset({ x: 0, y: 0 })
        setIsAnimating(false)
    }

    const getCardStyle = () => {
        const { x, y } = dragOffset
        const rotation = x * 0.1
        return {
            transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
            transition: isAnimating ? "all 0.3s ease-out" : "none",
        }
    }

    const getSwipeFeedback = () => {
        const { x, y } = dragOffset
        const maxOpacity = 0.5

        let color = 'transparent'
        let opacity = 0

        // Vertical Swipe (Up for Cart) - Blue
        if (y < 0 && Math.abs(y) > Math.abs(x)) {
            opacity = Math.min(Math.abs(y) / 300, maxOpacity)
            color = '#3b82f6' // Blue
        }
        // Horizontal Swipe
        else if (Math.abs(x) > Math.abs(y)) {
            opacity = Math.min(Math.abs(x) / 300, maxOpacity)
            if (x > 0) {
                color = '#22c55e' // Green (Bucket)
            } else {
                color = '#ef4444' // Red (Pass)
            }
        }

        return { color, opacity }
    }

    const { color: swipeColor, opacity: swipeOpacity } = getSwipeFeedback()

    return (
        <div className="relative h-full w-full flex flex-col">
            {/* Top Indicators */}
            <div className="flex justify-center gap-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 z-10 shrink-0">
                <span className="flex items-center gap-1">Cart <ArrowRight className="w-3 h-3" /></span>
                <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Bucket</span>
                <span className="flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Pass</span>
            </div>

            {/* Card Container */}
            <div className="flex-1 relative w-full mb-6 max-w-md mx-auto">
                {/* Actual Swipe Card */}
                <div
                    ref={cardRef}
                    className="relative bg-white rounded-2xl shadow-lg overflow-hidden touch-none cursor-grab active:cursor-grabbing select-none"
                    style={getCardStyle()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={(e) => {
                        setIsDragging(true)
                        startPos.current = { x: e.clientX, y: e.clientY }
                    }}
                    onMouseMove={(e) => {
                        if (!isDragging || isAnimating) return
                        const deltaX = e.clientX - startPos.current.x
                        const deltaY = e.clientY - startPos.current.y
                        setDragOffset({ x: deltaX, y: deltaY })
                    }}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                >
                    <div className="relative aspect-square bg-gray-100">
                        <img
                            src={currentProduct.image || "/placeholder.svg"}
                            alt={currentProduct.title}
                            className="w-full h-full object-cover pointer-events-none"
                        />
                        {/* Swipe Status Overlay */}
                        <div
                            className="absolute inset-0 z-20 pointer-events-none transition-colors duration-150"
                            style={{
                                backgroundColor: swipeColor,
                                opacity: swipeOpacity
                            }}
                        />
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{currentProduct.title}</h3>
                            <div className="text-right">
                                <p className="font-bold text-lg text-black">PKR {currentProduct.price.toLocaleString()}</p>
                                {currentProduct.originalPrice && (
                                    <p className="text-sm text-gray-500 line-through">
                                        PKR {currentProduct.originalPrice.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">{currentProduct.brand}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(currentProduct.rating) ? "fill-current" : "text-gray-300"}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">({currentProduct.rating})</span>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className="flex gap-3 mt-4"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleSwipeLeft}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Pass
                            </button>
                            <button
                                onClick={handleSwipeRight}
                                className="flex-1 bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" /> Bucket
                            </button>
                            <button
                                onClick={handleSwipeUp}
                                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" /> Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 pb-4">
                <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Discovery</span>
                    <span>{currentIndex + 1} of {products.length}</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-400 transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    )
}
