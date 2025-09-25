"use client"

import { useState, useRef } from "react"
import { Heart, ShoppingCart, ArrowUp, ArrowRight } from "lucide-react"

export default function SwipeInterface({ products, onAddToCart, onAddToBucket }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })

  const currentProduct = products[currentIndex]

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

    if (Math.abs(y) > Math.abs(x) && y < -threshold) {
      // Swipe up - add directly to cart
      handleSwipeUp()
    } else if (x > threshold) {
      // Swipe right - add to bucket
      handleSwipeRight()
    } else if (x < -threshold) {
      // Swipe left - pass
      handleSwipeLeft()
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 })
    }
  }

  const handleSwipeUp = () => {
    setIsAnimating(true)
    setDragOffset({ x: 0, y: -1000 })
    onAddToCart(currentProduct)

    setTimeout(() => {
      nextProduct()
    }, 300)
  }

  const handleSwipeRight = () => {
    setIsAnimating(true)
    setDragOffset({ x: 1000, y: 0 })
    onAddToBucket(currentProduct)

    setTimeout(() => {
      nextProduct()
    }, 300)
  }

  const handleSwipeLeft = () => {
    setIsAnimating(true)
    setDragOffset({ x: -1000, y: 0 })

    setTimeout(() => {
      nextProduct()
    }, 300)
  }

  const nextProduct = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to start
    }
    setDragOffset({ x: 0, y: 0 })
    setIsAnimating(false)
  }

  const getCardStyle = () => {
    const { x, y } = dragOffset
    const rotation = x * 0.1
    const opacity = Math.max(0.7, 1 - Math.abs(x) / 300)

    return {
      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      opacity,
      transition: isAnimating ? "all 0.3s ease-out" : "none",
    }
  }

  const getSwipeIndicatorOpacity = () => {
    const { x, y } = dragOffset
    return {
      right: Math.max(0, Math.min(1, x / 100)),
      left: Math.max(0, Math.min(1, -x / 100)),
      up: Math.max(0, Math.min(1, -y / 100)),
    }
  }

  if (!currentProduct) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No more products!</h3>
        <p className="text-gray-600">You've seen all available products.</p>
      </div>
    )
  }

  const indicators = getSwipeIndicatorOpacity()

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Swipe Instructions */}
      <div className="text-center mb-4 space-y-2">
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <span>Cart</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            <span>Bucket</span>
          </div>
          <div className="flex items-center gap-1">
            <span>←</span>
            <span>Pass</span>
          </div>
        </div>
      </div>

      {/* Product Card */}
      <div className="relative">
        <div
          ref={cardRef}
          className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
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
          {/* Swipe Indicators */}
          <div
            className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center z-10"
            style={{ opacity: indicators.right }}
          >
            <div className="text-white text-center">
              <Heart className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold text-lg">ADD TO BUCKET</p>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center z-10"
            style={{ opacity: indicators.left }}
          >
            <div className="text-white text-center">
              <p className="font-bold text-lg">PASS</p>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-blue-500 bg-opacity-80 flex items-center justify-center z-10"
            style={{ opacity: indicators.up }}
          >
            <div className="text-white text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold text-lg">ADD TO CART</p>
            </div>
          </div>

          {/* Product Image */}
          <div className="aspect-square bg-gray-100">
            <img
              src={currentProduct.image || "/placeholder.svg"}
              alt={currentProduct.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Product Info */}
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

            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{currentProduct.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${i < Math.floor(currentProduct.rating) ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">({currentProduct.rating})</span>
            </div>

            {/* Colors */}
            <div className="flex gap-2 mb-4">
              {currentProduct.colors.map((color) => (
                <div
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 border-gray-300 ${
                    color === "black"
                      ? "bg-black"
                      : color === "white"
                        ? "bg-white"
                        : color === "grey"
                          ? "bg-gray-500"
                          : color === "blue"
                            ? "bg-blue-500"
                            : color === "yellow"
                              ? "bg-yellow-400"
                              : color === "brown"
                                ? "bg-amber-600"
                                : "bg-gray-400"
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSwipeLeft}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Pass
              </button>
              <button
                onClick={handleSwipeRight}
                className="flex-1 bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Add to Bucket
              </button>
              <button
                onClick={handleSwipeUp}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {currentIndex + 1} of {products.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div
              className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
