"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, ShoppingCart, ArrowUp, ArrowRight, X, ArrowLeft, Archive, ShoppingBag, Star } from "lucide-react"

export default function SwipeInterfaceMobile({ products, onAddToCart, onAddToBucket, user, showToast }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    // Performance Optimization: Use refs for mutable state during high-frequency events
    const dragOffset = useRef({ x: 0, y: 0 })
    const isDragging = useRef(false)
    const startPos = useRef({ x: 0, y: 0 })
    const cardRef = useRef(null)
    const overlayRefs = useRef({ blue: null, green: null, red: null })

    const currentProduct = products[currentIndex]
    const nextProduct = products[currentIndex + 1]

    // Preload next product image to prevent flickering/loading delay
    useEffect(() => {
        if (nextProduct && nextProduct.image) {
            const img = new Image()
            img.src = nextProduct.image
        }
    }, [nextProduct])

    // Disable scrolling when this component is mounted on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = 'auto'
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            document.body.style.overflow = 'auto'
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const updateCardTransform = () => {
        if (cardRef.current) {
            const { x, y } = dragOffset.current
            const rotation = x * 0.1
            cardRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`

            // Update Overlay Opacity
            const threshold = 150 // Distance for full opacity

            // Reset all first
            if (overlayRefs.current.blue) overlayRefs.current.blue.style.opacity = 0
            if (overlayRefs.current.green) overlayRefs.current.green.style.opacity = 0
            if (overlayRefs.current.red) overlayRefs.current.red.style.opacity = 0

            // Apply specific opacity
            if (y < 0 && Math.abs(y) > Math.abs(x)) {
                // Up -> Blue
                if (overlayRefs.current.blue) {
                    overlayRefs.current.blue.style.opacity = Math.min(Math.abs(y) / threshold, 0.6)
                }
            } else if (Math.abs(x) > Math.abs(y)) {
                if (x > 0) {
                    // Right -> Green
                    if (overlayRefs.current.green) {
                        overlayRefs.current.green.style.opacity = Math.min(Math.abs(x) / threshold, 0.6)
                    }
                } else {
                    // Left -> Red
                    if (overlayRefs.current.red) {
                        overlayRefs.current.red.style.opacity = Math.min(Math.abs(x) / threshold, 0.6)
                    }
                }
            }
        }
    }

    const handleTouchStart = (e) => {
        if (isAnimating) return
        isDragging.current = true
        const touch = e.touches[0]
        startPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
        if (cardRef.current) {
            cardRef.current.style.transition = 'none'
        }
    }

    const handleTouchMove = (e) => {
        if (!isDragging.current || isAnimating) return
        const touch = e.touches[0]
        const deltaX = touch.clientX - startPos.current.x
        const deltaY = touch.clientY - startPos.current.y
        dragOffset.current = { x: deltaX, y: deltaY }

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(updateCardTransform)
    }

    const handleTouchEnd = () => {
        if (!isDragging.current || isAnimating) return
        isDragging.current = false

        const { x, y } = dragOffset.current
        const timeElapsed = Date.now() - startPos.current.time
        const velocity = Math.sqrt(x * x + y * y) / timeElapsed
        const isFlick = timeElapsed < 300 && velocity > 0.8 // Increased velocity req
        const threshold = 120 // Increased threshold for "proper" swipe

        // Project the current vector far out for natural "flying" feel
        // We multiply the current offset by a large factor to send it off-screen in the same direction
        const flyOutFactor = 20
        const endX = x * flyOutFactor
        const endY = y * flyOutFactor

        // Decision Logic
        // Priority: Up (Cart), Horizontal (Bucket/Pass) based on dominant axis

        const isVertical = Math.abs(y) > Math.abs(x)
        const isUp = y < -50 // Ensure it's actually moving up, not just vertical drift

        if (isVertical && isUp && (Math.abs(y) > threshold || (isFlick && y < 0))) {
            // Cart (Up)
            if (!user) {
                if (showToast) showToast("Please log in to add items to cart", "error")
                resetPosition()
            } else {
                animateSwipe(endX, -1500, 400, () => onAddToCart(currentProduct), 'up')
            }
        } else if (!isVertical && (Math.abs(x) > threshold || isFlick)) {
            if (x > 0) {
                // Bucket (Right)
                animateSwipe(1500, endY, 400, () => onAddToBucket(currentProduct), 'right')
            } else {
                // Pass (Left)
                animateSwipe(-1500, endY, 400, null, 'left')
            }
        } else {
            // Reset position (rubber band effect)
            resetPosition()
        }
    }

    const resetPosition = () => {
        dragOffset.current = { x: 0, y: 0 }
        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // bouncier snapback
            updateCardTransform()
        }
    }

    const animateSwipe = (endX, endY, duration = 300, actionCallback, direction) => {
        setIsAnimating(true)
        if (cardRef.current) {
            cardRef.current.style.transition = `transform ${duration}ms ease-out`
            cardRef.current.style.transform = `translate(${endX}px, ${endY}px) rotate(${endX * 0.05}deg)`
        }

        // Show indicator during exit animation
        if (direction === 'up' && overlayRefs.current.blue) overlayRefs.current.blue.style.opacity = 0.7
        if (direction === 'right' && overlayRefs.current.green) overlayRefs.current.green.style.opacity = 0.7
        if (direction === 'left' && overlayRefs.current.red) overlayRefs.current.red.style.opacity = 0.7

        if (actionCallback) actionCallback()

        setTimeout(() => {
            nextProductIdx()
        }, duration)
    }

    // Triggered by buttons
    const handleSwipeUp = () => {
        if (!user) {
            if (showToast) showToast("Please log in to add items to cart", "error")
            // Visual shake or something? Optional.
            return
        }
        animateSwipe(0, -1000, 500, () => onAddToCart(currentProduct), 'up')
    }
    const handleSwipeRight = () => animateSwipe(1000, 0, 500, () => onAddToBucket(currentProduct), 'right')
    const handleSwipeLeft = () => animateSwipe(-1000, 0, 500, null, 'left')

    const nextProductIdx = () => {
        if (currentIndex < products.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            setCurrentIndex(0) // Loop
        }

        // Reset card styling for next item
        dragOffset.current = { x: 0, y: 0 }
        setIsAnimating(false)
        if (cardRef.current) {
            cardRef.current.style.transition = 'none'
            cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)'
        }

        // Reset overlays
        if (overlayRefs.current.blue) overlayRefs.current.blue.style.opacity = 0
        if (overlayRefs.current.green) overlayRefs.current.green.style.opacity = 0
        if (overlayRefs.current.red) overlayRefs.current.red.style.opacity = 0
    }

    // If no more products, show end state
    if (!currentProduct) {
        return (
            <div className="text-center py-16 h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No more products!</h3>
                <p className="text-gray-600">You've seen all available products.</p>
            </div>
        )
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
                    className="absolute inset-x-4 top-2 bottom-20 rounded-[32px] overflow-hidden shadow-none border border-gray-100 bg-white touch-none cursor-grab active:cursor-grabbing select-none"
                    // style prop is removed in favor of direct DOM manipulation for performance
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={(e) => {
                        isDragging.current = true
                        startPos.current = { x: e.clientX, y: e.clientY }
                        if (cardRef.current) cardRef.current.style.transition = 'none'
                    }}
                    onMouseMove={(e) => {
                        if (!isDragging.current || isAnimating) return
                        const deltaX = e.clientX - startPos.current.x
                        const deltaY = e.clientY - startPos.current.y
                        dragOffset.current = { x: deltaX, y: deltaY }
                        requestAnimationFrame(updateCardTransform)
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
                        draggable="false"
                    />

                    {/* Swipe Feedback Overlays */}
                    {/* Blue (Up - Cart) */}
                    <div ref={el => overlayRefs.current.blue = el} className="absolute inset-0 bg-blue-500 z-10 pointer-events-none opacity-0 transition-opacity duration-75 mix-blend-overlay"></div>
                    {/* Green (Right - Bucket) */}
                    <div ref={el => overlayRefs.current.green = el} className="absolute inset-0 bg-green-500 z-10 pointer-events-none opacity-0 transition-opacity duration-75 mix-blend-overlay"></div>
                    {/* Red (Left - Pass) */}
                    <div ref={el => overlayRefs.current.red = el} className="absolute inset-0 bg-red-500 z-10 pointer-events-none opacity-0 transition-opacity duration-75 mix-blend-overlay"></div>

                    {/* Top Gradient for Text Readability */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-20"></div>

                    {/* Top Info (Title, Price) */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start text-white pointer-events-none z-30">
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
