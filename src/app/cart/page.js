"use client"

import { useState, useEffect, useRef } from "react"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Tag,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ToastNotification from "../components/ToastNotification"

export default function CartPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [cartData, setCartData] = useState(null) // Store full cart data from API
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [itemsToRemove, setItemsToRemove] = useState(new Set()) // Track items that should be removed after animation
  const [isClearingCart, setIsClearingCart] = useState(false) // Track if cart is being cleared
  const profileDropdownRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")

  // Initialize user from localStorage
  useEffect(() => {
    try {
      const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (rawUser) {
        const parsed = JSON.parse(rawUser)
        const sessionUser = parsed?.user || parsed
        setUser(sessionUser)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Load cart items from localStorage or API
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)
      try {
        // If user is logged in, fetch from API
        if (user && user.role === "customer") {
          const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
          if (token) {
            const res = await fetch("/api/customer/cart", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            if (res.ok) {
              const data = await res.json()
              if (data.success && data.cart) {
                // Store full cart data
                setCartData(data.cart)

                // Set applied coupon if exists
                if (data.cart.couponCode && data.cart.couponDiscount > 0) {
                  setAppliedCoupon({
                    code: data.cart.couponCode,
                    discount: data.cart.couponDiscount,
                  })
                } else {
                  setAppliedCoupon(null)
                }

                if (data.cart.items && data.cart.items.length > 0) {
                  // Transform API cart items to local format
                  const transformed = data.cart.items.map((item) => {
                    // Safely extract brand name
                    let brandName = "Brand"
                    if (item.product?.brand) {
                      if (typeof item.product.brand === "string") {
                        brandName = item.product.brand
                      } else if (item.product.brand?.name) {
                        brandName = item.product.brand.name
                      }
                    }

                    return {
                      id: item.product?._id || item.product,
                      title: item.product?.name || "Product",
                      brand: brandName,
                      price: item.price,
                      originalPrice: item.originalPrice || item.price,
                      image: item.product?.thumbnail?.SD || item.product?.images?.[0]?.SD || "/placeholder.svg",
                      quantity: item.quantity,
                      selectedSize: item.size,
                      selectedColor: item.color,
                      itemId: item._id,
                    }
                  })
                  setCartItems(transformed)
                } else {
                  // Empty cart
                  setCartItems([])
                }
              } else {
                // Empty cart or error
                setCartItems([])
                setCartData(null)
              }
            } else {
              // API error, try localStorage as fallback
              const localCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
              if (localCart) {
                const parsed = JSON.parse(localCart)
                const sanitized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
                  ...item,
                  brand: typeof item.brand === "string"
                    ? item.brand
                    : (item.brand?.name || "Brand"),
                }))
                setCartItems(sanitized)
              }
            }
          }
        } else {
          // Guest user - load from localStorage
          const localCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
          if (localCart) {
            const parsed = JSON.parse(localCart)
            // Sanitize cart items to ensure brand is always a string
            const sanitized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
              ...item,
              brand: typeof item.brand === "string"
                ? item.brand
                : (item.brand?.name || "Brand"),
            }))
            setCartItems(sanitized)
          } else {
            setCartItems([])
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
        // On error, try localStorage as fallback
        try {
          const localCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
          if (localCart) {
            const parsed = JSON.parse(localCart)
            const sanitized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
              ...item,
              brand: typeof item.brand === "string"
                ? item.brand
                : (item.brand?.name || "Brand"),
            }))
            setCartItems(sanitized)
          }
        } catch (e) {
          console.error("Error loading from localStorage:", e)
        }
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    setIsProfileDropdownOpen(false)
  }

  const refreshCart = async () => {
    if (user && user.role === "customer") {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (token) {
        try {
          const res = await fetch("/api/customer/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.cart) {
              setCartData(data.cart)

              // Set applied coupon if exists
              if (data.cart.couponCode && data.cart.couponDiscount > 0) {
                setAppliedCoupon({
                  code: data.cart.couponCode,
                  discount: data.cart.couponDiscount,
                })
              } else {
                setAppliedCoupon(null)
              }

              if (data.cart.items && data.cart.items.length > 0) {
                const transformed = data.cart.items.map((item) => {
                  let brandName = "Brand"
                  if (item.product?.brand) {
                    if (typeof item.product.brand === "string") {
                      brandName = item.product.brand
                    } else if (item.product.brand?.name) {
                      brandName = item.product.brand.name
                    }
                  }

                  return {
                    id: item.product?._id || item.product,
                    title: item.product?.name || "Product",
                    brand: brandName,
                    price: item.price,
                    originalPrice: item.originalPrice || item.price,
                    image: item.product?.thumbnail?.SD || item.product?.images?.[0]?.SD || "/placeholder.svg",
                    quantity: item.quantity,
                    selectedSize: item.size,
                    selectedColor: item.color,
                    itemId: item._id,
                  }
                })
                setCartItems(transformed)
              } else {
                setCartItems([])
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing cart:", error)
        }
      }
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }

    // Optimistically update UI for better UX
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    )

    // If user is logged in, update via API
    if (user && user.role === "customer") {
      const item = cartItems.find((i) => i.id === itemId)
      if (item?.itemId) {
        try {
          const token = localStorage.getItem("authToken")
          const res = await fetch(`/api/customer/cart/${item.itemId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQuantity }),
          })

          const data = await res.json()

          if (res.ok && data.success) {
            // Update cart data from API response
            if (data.cart) {
              setCartData(data.cart)

              // Update applied coupon if exists
              if (data.cart.couponCode && data.cart.couponDiscount > 0) {
                setAppliedCoupon({
                  code: data.cart.couponCode,
                  discount: data.cart.couponDiscount,
                })
              } else {
                setAppliedCoupon(null)
              }

              // Update cart items from API response to ensure consistency
              if (data.cart.items && data.cart.items.length > 0) {
                const transformed = data.cart.items.map((cartItem) => {
                  let brandName = "Brand"
                  if (cartItem.product?.brand) {
                    if (typeof cartItem.product.brand === "string") {
                      brandName = cartItem.product.brand
                    } else if (cartItem.product.brand?.name) {
                      brandName = cartItem.product.brand.name
                    }
                  }

                  return {
                    id: cartItem.product?._id || cartItem.product,
                    title: cartItem.product?.name || "Product",
                    brand: brandName,
                    price: cartItem.price,
                    originalPrice: cartItem.originalPrice || cartItem.price,
                    image: cartItem.product?.thumbnail?.SD || cartItem.product?.images?.[0]?.SD || "/placeholder.svg",
                    quantity: cartItem.quantity,
                    selectedSize: cartItem.size,
                    selectedColor: cartItem.color,
                    itemId: cartItem._id,
                  }
                })
                setCartItems(transformed)
              }
              window.dispatchEvent(new Event("cart-updated"))
            }
          } else {
            // Revert optimistic update on error
            await refreshCart()
            showToast(data.error || "Failed to update quantity", "error")
          }
        } catch (error) {
          console.error("Error updating quantity:", error)
          // Revert optimistic update on error
          await refreshCart()
          showToast("Failed to update quantity", "error")
        }
      }
    } else {
      // Update localStorage for guest users
      try {
        const updated = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        localStorage.setItem("cart", JSON.stringify(updated))
        window.dispatchEvent(new Event("cart-updated"))
      } catch (e) {
        console.warn("Failed to update cart", e)
        // Revert optimistic update on error
        await refreshCart()
      }
    }
  }

  const removeItem = async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId)
    if (!item) return

    // Store item data for API call
    const itemData = item

    // Mark item for removal (triggers exit animation but keeps it in array)
    setItemsToRemove((prev) => new Set(prev).add(itemId))

    // Call API immediately in the background
    if (user && user.role === "customer") {
      if (itemData?.itemId) {
        try {
          const token = localStorage.getItem("authToken")
          const res = await fetch(`/api/customer/cart/${itemData.itemId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (!res.ok) {
            // If API fails, cancel the removal
            setItemsToRemove((prev) => {
              const next = new Set(prev)
              next.delete(itemId)
              return next
            })
            showToast("Failed to remove item", "error")
            return
          }
        } catch (error) {
          console.error("Error removing item:", error)
          // If API fails, cancel the removal
          setItemsToRemove((prev) => {
            const next = new Set(prev)
            next.delete(itemId)
            return next
          })
          showToast("Failed to remove item", "error")
          return
        }
      }
    } else {
      // For guest users, update localStorage immediately
      try {
        const updated = cartItems.filter((item) => item.id !== itemId)
        localStorage.setItem("cart", JSON.stringify(updated))
      } catch (e) {
        console.warn("Failed to update cart", e)
        // Cancel removal on error
        setItemsToRemove((prev) => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
        return
      }
    }

    // Wait for animation to complete (400ms), then remove from state
    setTimeout(() => {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId))
      setItemsToRemove((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })

      // Refresh cart from API to get updated totals (only for logged-in users)
      if (user && user.role === "customer") {
        refreshCart()
      }
      window.dispatchEvent(new Event("cart-updated"))
    }, 400)
  }

  const clearCart = async () => {
    if (cartItems.length === 0) return

    // Mark all items for removal to trigger animation
    setIsClearingCart(true)
    const allItemIds = new Set(cartItems.map((item) => item.id))
    setItemsToRemove(allItemIds)

    // Call API immediately in the background
    if (user && user.role === "customer") {
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch("/api/customer/cart", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          // If API fails, cancel the clearing
          setIsClearingCart(false)
          setItemsToRemove(new Set())
          showToast("Failed to clear cart", "error")
          return
        }
      } catch (error) {
        console.error("Error clearing cart:", error)
        // If API fails, cancel the clearing
        setIsClearingCart(false)
        setItemsToRemove(new Set())
        showToast("Failed to clear cart", "error")
        return
      }
    } else {
      // For guest users, clear localStorage immediately
      try {
        localStorage.setItem("cart", JSON.stringify([]))
      } catch (e) {
        console.warn("Failed to clear cart", e)
        setIsClearingCart(false)
        setItemsToRemove(new Set())
        return
      }
    }

    // Wait for animation to complete (400ms), then clear the cart
    setTimeout(() => {
      setCartItems([])
      setItemsToRemove(new Set())
      setIsClearingCart(false)
      setAppliedCoupon(null)
      setCouponCode("")

      // Refresh cart from API to get updated totals (only for logged-in users)
      if (user && user.role === "customer") {
        refreshCart()
      }
      window.dispatchEvent(new Event("cart-updated"))
    }, 400)
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast("Please enter a coupon code", "error")
      return
    }

    if (user && user.role === "customer") {
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch("/api/customer/cart/coupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ couponCode: couponCode.trim().toUpperCase() }),
        })

        const data = await res.json()
        if (res.ok && data.success) {
          setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: data.cart.couponDiscount })
          setCartData(data.cart)
          showToast("Coupon applied successfully!", "info")
          setCouponCode("")
          // Refresh cart to get updated totals
          await refreshCart()
        } else {
          showToast(data.error || "Invalid coupon code", "error")
        }
      } catch (error) {
        console.error("Error applying coupon:", error)
        showToast("Failed to apply coupon", "error")
      }
    } else {
      showToast("Please log in to apply coupon", "error")
    }
  }

  const removeCoupon = async () => {
    if (user && user.role === "customer") {
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch("/api/customer/cart/coupon", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          setAppliedCoupon(null)
          showToast("Coupon removed", "info")
          // Refresh cart to get updated totals
          await refreshCart()
        }
      } catch (error) {
        console.error("Error removing coupon:", error)
      }
    }
  }

  // Calculate totals - use API data if available, otherwise calculate locally
  const subtotal = cartData?.subtotal ?? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalDiscount = cartData?.totalDiscount ?? cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  )
  const couponDiscount = cartData?.couponDiscount ?? appliedCoupon?.discount ?? 0
  const total = cartData?.total ?? (subtotal - couponDiscount)
  const estimatedShipping = cartData?.estimatedShipping ?? (subtotal >= 5000 ? 0 : 200)
  const estimatedTax = cartData?.estimatedTax ?? (subtotal * 0.08)
  const estimatedTotal = cartData?.estimatedTotal ?? (total + estimatedShipping + estimatedTax)
  const totalItems = cartData?.totalItems ?? cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 h-16 w-full"></header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/3 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-lg mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/products" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors transform translate-y-0.5">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back</span>
              </Link>
              <Link href="/">
                <img src="/logo.png" alt="SWAY Logo" className="h-[24px] w-auto" />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 transition-colors bg-transparent"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-900">{user.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href={user.role === "brand" ? "/brandDashboard" : "/customerDashboard"}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-yellow-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center bg-gray-100/80 backdrop-blur-sm p-1 rounded-full border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
                  <Link href="/login" className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-full transition-all">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-yellow-400 text-black px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm hover:bg-yellow-500 transition-all ml-1"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              disabled={isClearingCart}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isClearingCart ? "Clearing..." : "Clear Cart"}
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {cartItems.map((item, index) => {
                  // Use itemId as primary key, fallback to composite key
                  const uniqueKey = item.itemId || `cart-item-${item.id}-${item.selectedSize || 'no-size'}-${item.selectedColor || 'no-color'}-${index}`
                  const isRemoving = itemsToRemove.has(item.id)
                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 1, x: 0 }}
                      animate={isRemoving ? { opacity: 0, x: -500 } : { opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: -500,
                        transition: {
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1]
                        }
                      }}
                      layout
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      className="bg-white rounded-lg shadow-sm p-6"
                      style={{ pointerEvents: isRemoving ? 'none' : 'auto' }}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link href={`/productDetails/${item.id}`} className="flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Link
                                href={`/productDetails/${item.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-yellow-600 transition-colors"
                              >
                                {item.title}
                              </Link>
                              <p className="text-sm text-gray-600 mt-1">
                                {typeof item.brand === "string" ? item.brand : (item.brand?.name || "Brand")}
                              </p>
                              {(item.selectedSize || item.selectedColor) && (
                                <div className="flex gap-2 mt-2">
                                  {item.selectedSize && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors ml-4"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-900">
                                PKR {item.price.toLocaleString()}
                              </span>
                              {item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  PKR {item.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600 font-medium">-PKR {totalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon Discount</span>
                      <span className="text-green-600 font-medium">-PKR {couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900 font-medium">
                      {estimatedShipping === 0 ? "Free" : `PKR ${estimatedShipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">PKR {estimatedTax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">PKR {estimatedTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    if (!user) {
                      showToast("Please log in to checkout", "error")
                      router.push("/login")
                    } else {
                      router.push("/checkout")
                    }
                  }}
                  className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors mb-4"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block w-full text-center text-gray-600 hover:text-black transition-colors text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

