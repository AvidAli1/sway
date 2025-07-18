"use client"

import { useState, useRef } from "react"
import { ShoppingCart, X, RotateCcw } from "lucide-react"
import Image from 'next/image';

export default function SwipeInterface({ products, onAddToCart }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matches, setMatches] = useState(0)
  const [dragStart, setDragStart] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef(null)

  const currentProduct = products[currentIndex]

  const handleSwipe = (direction) => {
    if (isAnimating) return

    setIsAnimating(true)

    if (direction === "right") {
      setMatches((prev) => prev + 1)
      onAddToCart(currentProduct)
    }

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
      setDragOffset(0)
      setIsAnimating(false)
    }, 300)
  }

  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!dragStart || isAnimating) return

    const deltaX = e.clientX - dragStart.x
    setDragOffset(deltaX)
  }

  const handleMouseUp = () => {
    if (!dragStart || isAnimating) return

    const threshold = 100
    if (Math.abs(dragOffset) > threshold) {
      handleSwipe(dragOffset > 0 ? "right" : "left")
    } else {
      setDragOffset(0)
    }

    setDragStart(null)
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e) => {
    if (!dragStart || isAnimating) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    setDragOffset(deltaX)
  }

  const handleTouchEnd = () => {
    if (!dragStart || isAnimating) return

    const threshold = 100
    if (Math.abs(dragOffset) > threshold) {
      handleSwipe(dragOffset > 0 ? "right" : "left")
    } else {
      setDragOffset(0)
    }

    setDragStart(null)
  }

  if (!currentProduct) return null

  return (
    <div className="max-w-md mx-auto">
      {/* Stats */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{matches}</div>
          <div className="text-sm text-gray-600">Matches</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-black">{currentIndex + 1}</div>
          <div className="text-sm text-gray-600">of {products.length}</div>
        </div>
      </div>

      {/* Swipe Card */}
      <div className="relative h-[600px] mb-6">
        <div
          ref={cardRef}
          className={`absolute inset-0 bg-white rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing transition-transform duration-300 ${isAnimating ? (dragOffset > 0 ? "translate-x-full rotate-12" : "-translate-x-full -rotate-12") : ""}`}
          style={{
            transform: !isAnimating ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)` : undefined,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Product Image */}
          <div className="relative h-2/3 overflow-hidden rounded-t-2xl">
            <Image
              src={currentProduct.image || "/placeholder.svg"}
              alt={currentProduct.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 h-1/3 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-black mb-1">{currentProduct.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{currentProduct.brand}</p>
              <p className="text-2xl font-bold text-yellow-400">PKR {currentProduct.price.toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              {currentProduct.colors.map((color) => (
                <div
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 border-gray-300 ${color === "black"
                      ? "bg-black"
                      : color === "white"
                        ? "bg-white"
                        : color === "grey"
                          ? "bg-gray-500"
                          : color === "blue"
                            ? "bg-blue-500"
                            : color === "red"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Swipe Indicators */}
          <div
            className={`absolute top-8 left-8 px-4 py-2 rounded-full font-bold text-lg transition-opacity ${dragOffset > 50 ? "opacity-100 bg-green-500 text-white" : "opacity-0"}`}
          >
            LIKE
          </div>
          <div
            className={`absolute top-8 right-8 px-4 py-2 rounded-full font-bold text-lg transition-opacity ${dragOffset < -50 ? "opacity-100 bg-red-500 text-white" : "opacity-0"}`}
          >
            PASS
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={() => handleSwipe("left")}
          className="w-14 h-14 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1))}
          className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-yellow-400 hover:text-yellow-400 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleSwipe("right")}
          className="w-14 h-14 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-6 text-gray-600 text-sm">
        <p>Swipe right to add to cart • Swipe left to pass</p>
        <p>Or use the buttons below</p>
      </div>
    </div>
  )
}
