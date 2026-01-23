"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import ToastNotification from "../../components/ToastNotification"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([]) // Store real reviews

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [user, setUser] = useState(null)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")
  const [expandedImage, setExpandedImage] = useState(null)

  // Initialize user and cart from localStorage when running in browser
  useEffect(() => {
    try {
      const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (rawUser) {
        const parsed = JSON.parse(rawUser)
        const sessionUser = parsed?.user || parsed
        setUser(sessionUser)
      }
    } catch (e) {
      console.warn("Failed to parse stored user", e)
    }

    try {
      const rawCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
      if (rawCart) setCartItems(JSON.parse(rawCart))
    } catch (e) {
      console.warn("Failed to parse stored cart", e)
    }
  }, [])

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

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    setIsProfileDropdownOpen(false)
  }

  // Persist cart to localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(cartItems))
    } catch (e) {
      console.warn("Failed to persist cart", e)
    }
  }, [cartItems])
  // Fetch product from backend
  useEffect(() => {
    let mounted = true
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/customer/products/${productId}`)
        let data
        try {
          data = await res.json()
        } catch (jsonErr) {
          throw new Error("Invalid server response")
        }
        // Log backend response for debugging in browser console
        try {
          console.log(`GET /api/customer/products/${productId} ->`, { status: res.status, ok: res.ok, data })
        } catch (logErr) {
          // swallow logging errors
          console.warn('Failed to log product fetch response', logErr)
        }
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Product not found')
        }

        if (!mounted) return
        const p = data.product
        // normalize images to an array of SD URLs for display
        const images = (p.images || []).map((img) => img.SD || img.HD || img)
        const thumbnailUrl = p.thumbnail?.SD || p.thumbnail?.HD || images[0] || null

        setProduct({
          ...p,
          id: p._id, // Ensure id is available for API calls
          images,
          thumbnail: thumbnailUrl,
        })

        setRelatedProducts((data.relatedProducts || []).map(p => ({
          id: p._id,
          title: p.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.originalPrice,
          images: p.thumbnail?.SD || p.images?.[0]?.SD || '/placeholder.svg',
          rating: p.ratings || 0,
          reviews: p.numReviews || 0,
          isSponsored: p.isFeatured,
        })))
        setSimilarProducts((data.similarProducts || []).map(p => ({
          id: p._id,
          title: p.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.originalPrice,
          images: p.thumbnail?.SD || p.images?.[0]?.SD || '/placeholder.svg',
          rating: p.ratings || 0,
          reviews: p.numReviews || 0,
          isSponsored: p.isFeatured,
        })))

        // Fetch Reviews
        try {
          const reviewsRes = await fetch(`/api/customer/reviews?productId=${productId}`)
          const reviewsData = await reviewsRes.json()
          if (reviewsData.success) {
            setReviews(reviewsData.reviews)
          }
        } catch (rErr) {
          console.warn("Failed to fetch reviews", rErr)
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        if (mounted) setError(err.message || 'Failed to load product')
      } finally {
        if (mounted) setLoading(false)
      }
    }


    fetchProduct()
    return () => { mounted = false }
  }, [productId])

  // Calculate real rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0]
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingDistribution[5 - r.rating]++ // Store 5 star at index 0
    }
  })

  // Note: We are now using real 'reviews' state, so remove mock 'reviews' array definition if it conflicts
  // or just ignore the mock variable.
  // We will simply NOT define 'const reviews = [...]' mock data anymore or rename it if needed.

  useEffect(() => {
    if (product && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
    if (product && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0])
    }
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || "Product Not Found"}</h1>
          <Link href="/products" className="text-yellow-600 hover:text-yellow-700">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      showToast("Please log in first", "info")
      return
    }

    // Check if user is a customer (brands cannot make orders)
    if (user.role === "brand") {
      showToast("Brands are not allowed to make orders. Please log in with a customer account.", "error")
      return
    }

    if (!selectedSize || !selectedColor) {
      showToast("Please select size and color", "info")
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token) {
        showToast("Please log in first", "info")
        return
      }

      const res = await fetch("/api/customer/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id || product._id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Update local cart items from API response
        if (data.cart && data.cart.items) {
          const transformed = data.cart.items.map((item) => ({
            id: item.product?._id || item.product,
            title: item.product?.name || "Product",
            brand: typeof item.product?.brand === "string"
              ? item.product.brand
              : (item.product?.brand?.name || "Brand"),
            price: item.price,
            originalPrice: item.originalPrice || item.price,
            image: item.product?.thumbnail?.SD || item.product?.images?.[0]?.SD || "/placeholder.svg",
            quantity: item.quantity,
            selectedSize: item.size,
            selectedColor: item.color,
            itemId: item._id,
          }))
          setCartItems(transformed)
        }
      } else {
        showToast(data.error || "Failed to add item to cart", "error")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      showToast("An error occurred while adding to cart", "error")
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Redirect to checkout or cart page
    window.location.href = "/cart"
  }

  const handleVirtualTryOn = () => {
    // Navigate to virtual try-on page with product ID
    window.location.href = `/virtual_tryon/${product.id}`
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === (product.images?.length || 1) - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? (product.images?.length || 1) - 1 : prev - 1))
  }

  const getColorClass = (color) => {
    const colorMap = {
      black: "bg-black",
      white: "bg-white border-2 border-gray-300",
      grey: "bg-gray-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-400",
      brown: "bg-amber-600",
      pink: "bg-pink-400",
    }
    return colorMap[color] || "bg-gray-400"
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
              <Link
                href="/products"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back</span>
              </Link>
              <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>

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
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
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
                <Link
                  href="/login"
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black">
            Products
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-black font-medium">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
              <img
                src={product.images?.[selectedImageIndex] || product.image}
                alt={product.title}
                className="w-full h-[500px] object-cover"
              />

              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isWishlisted ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"
                    }`}
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index ? "border-yellow-400" : "border-gray-200"
                      }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              <p className="text-sm text-gray-600 mb-2">{product.brand?.name || product.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{product.rating}</span>
                </div>
                <span className="text-gray-600">({product.reviews} reviews)</span>
                {product.isSponsored && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                    Sponsored
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    PKR {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-colors ${selectedColor === color ? "border-yellow-400 ring-2 ring-yellow-200" : "border-gray-300"
                      } ${getColorClass(color)}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size: {selectedSize}</h3>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg font-medium transition-colors ${selectedSize === size
                      ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">{product.stockCount} items available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 bg-yellow-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Virtual Try-on Button */}
              <div className="flex justify-center pt-2">
                <button onClick={handleVirtualTryOn} className="pill-button">
                  <span className="label">Virtual Try-on</span>
                </button>
              </div>

              {!product.inStock && <p className="text-red-600 text-center font-medium">Out of Stock</p>}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over PKR 2000</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                    ? "border-yellow-400 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab}
                  {tab === "reviews" && ` (${reviews ? reviews.length : 0})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Premium quality materials</li>
                    <li>Comfortable fit for all-day wear</li>
                    <li>Durable construction</li>
                    <li>Easy care instructions</li>
                  </ul>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {product.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                  product.specifications.map((spec, index) => (
                    <div key={spec._id || index} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">{spec.key}:</span>
                      <span className="text-gray-700">{spec.value}</span>
                    </div>
                  ))
                ) : typeof product.specifications === 'object' && product.specifications !== null ? (
                  // Fallback for object format (legacy support)
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">{key}:</span>
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No specifications available</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Reviews Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{product.rating}</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{reviews.length} reviews</p>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating, idx) => {
                        const count = ratingDistribution[idx]
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={rating} className="flex items-center gap-3 mb-2">
                            <span className="text-sm w-3">{rating}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>
                  )}
                  {reviews.map((review) => (
                    <div key={review._id || review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{review.userName || "Customer"}</h4>
                            {review.isVerifiedPurchase && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{new Date(review.createdAt || review.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {review.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Review by ${review.userName}`}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setExpandedImage(img)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Lightbox Modal */}
        {expandedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setExpandedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-50"
              onClick={() => setExpandedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={expandedImage}
              alt="Review Full Screen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/productDetails/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={relatedProduct.images || "/placeholder.svg"}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.isSponsored && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                        Sponsored
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{relatedProduct.rating}</span>
                      <span className="text-sm text-gray-400">({relatedProduct.reviews})</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand?.name || relatedProduct.brand}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">PKR {relatedProduct.price.toLocaleString()}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {relatedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
