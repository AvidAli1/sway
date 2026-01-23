"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, ShoppingCart, ArrowUp, ArrowRight, X, ArrowLeft, Archive, ShoppingBag, Star } from "lucide-react"

export default function SwipeInterfaceMobile({ products, onAddToCart, onAddToBucket }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const cardRef = useRef(null)
    const startPos = useRef({ x: 0, y: 0 })

    const currentProduct = products[currentIndex]

    // Disable scrolling when this component is mounted on mobile
    // Disable scrolling when this component is mounted on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = 'auto'
            }
        }

        // Initial check
        handleResize()

        window.addEventListener('resize', handleResize)
        return () => {
            document.body.style.overflow = 'auto'
            window.removeEventListener('resize', handleResize)
        }
    }, [])

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

    return (
        <div className="h-full w-full bg-white flex flex-col">


            {/* Top Indicators */}
            <div className="flex justify-center gap-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 z-10 shrink-0">
                <span className="flex items-center gap-1">Cart <ArrowRight className="w-3 h-3" /></span>
                <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Bucket</span>
                <span className="flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Pass</span>
            </div>

            {/* Card Container */}
            <div className="flex-1 relative w-full px-8 pb-8 overflow-hidden">
                <div
                    ref={cardRef}
                    className="absolute inset-x-4 top-0 bottom-4 rounded-[32px] overflow-hidden shadow-none border border-gray-100 bg-white touch-none cursor-grab active:cursor-grabbing select-none"
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
                    {/* Main Product Image */}
                    {/* Main Product Image */}
                    <img
                        src={currentProduct.image || "/placeholder.svg"}
                        alt={currentProduct.title}
                        className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Top Gradient for Text Readability */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none"></div>

                    {/* Top Info (Title, Price) */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start text-white pointer-events-none">
                        <div className="max-w-[70%]">
                            <h1 className="text-3xl font-extrabold leading-tight drop-shadow-md">{currentProduct.title}</h1>
                            <p className="text-white/80 text-sm font-medium mt-1">{currentProduct.brand}</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-yellow-400 font-bold text-xl whitespace-nowrap drop-shadow-md">PKR {currentProduct.price.toLocaleString()}</span>
                            {currentProduct.originalPrice && (
                                <span className="block text-white/70 text-sm line-through mt-0.5 drop-shadow-sm">PKR {currentProduct.originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                    </div>



                    {/* Bottom Info (Colors, Rating) */}
                    <div className="absolute bottom-24 left-6 right-6 flex flex-col gap-6 pointer-events-none">
                        <div className="flex items-center justify-between">
                            {/* Colors */}
                            <div className="flex gap-2.5">
                                {currentProduct.colors && currentProduct.colors.map((color, idx) => (
                                    <div key={idx} className={`w-7 h-7 rounded-full border-2 shadow-sm ${color === 'black' ? 'bg-black border-white' :
                                        color === 'white' ? 'bg-white border-gray-300' :
                                            `bg-${color}-500 border-white`
                                        }`}></div>
                                ))}
                            </div>

                            {/* Rating Pill */}
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(currentProduct.rating) ? "fill-yellow-400" : "text-white/30 fill-none"}`} />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-white">({currentProduct.rating})</span>
                            </div>
                        </div>
                    </div>

                    {/* Interaction Buttons Row */}
                    <div
                        className="absolute bottom-6 left-6 right-6 z-40 flex justify-between items-center"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <button onClick={handleSwipeLeft} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors active:scale-95">
                            <X className="w-8 h-8" />
                        </button>
                        <div className="flex gap-8">
                            <button onClick={handleSwipeRight} className="w-14 h-14 rounded-full bg-yellow-400 text-black font-bold shadow-xl flex items-center justify-center active:scale-95 transition-transform">
                                <ShoppingBag className="w-8 h-8" />
                            </button>
                            <button className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center text-pink-500 active:scale-95 transition-transform">
                                <Heart className="w-8 h-8" />
                            </button>
                        </div>
                        <button onClick={handleSwipeUp} className="w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-xl flex items-center justify-center active:scale-95 transition-transform hover:bg-gray-800">
                            <ShoppingCart className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}
