"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ShoppingCart, Heart, Star, ArrowRight, Filter, X, Menu, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import Link from "next/link"
import ProductModal from "./components/ProductModal"
import ToastNotification from "./components/ToastNotification"
import { useCart } from "./context/CartContext"

// Custom hook for intersection observer
const useInView = (threshold = 0.1, rootMargin = "0px") => {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          // Once animation is triggered, we can disconnect the observer
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isInView]
}

export default function HomePage() {
  const { cartCount, updateCartCount } = useCart()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [headerLoaded, setHeaderLoaded] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const [featuredProducts, setFeaturedProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [wishlist, setWishlist] = useState(new Set())

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")

  const profileDropdownRef = useRef(null)

  // Intersection Observer refs for different sections
  const [heroRef, heroInView] = useInView(0.2)
  const [promotionsRef, promotionsInView] = useInView(0.3)
  const [productsRef, productsInView] = useInView(0.2)
  const [ctaRef, ctaInView] = useInView(0.3)

  useEffect(() => {
    // Only animate header immediately on load
    const timer = setTimeout(() => {
      setHeaderLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Read session from localStorage so landing header shows avatar/logout when logged in
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      if (!raw) return
      const parsed = JSON.parse(raw)
      const sessionUser = parsed?.user || parsed
      if (sessionUser) {
        setUser(sessionUser)
        // Fetch wishlist if user exists
        const uId = sessionUser._id || sessionUser.id
        if (uId) {
          fetch(`/api/customer/wishlist?userId=${uId}`)
            .then(res => res.json())
            .then(data => {
              if (data.wishlist) {
                setWishlist(new Set(data.wishlist.map(w => typeof w === 'object' ? w._id : w)))
              }
            })
            .catch(err => console.error("Wishlist fetch error", err))
        }
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // Fetch featured products
  useEffect(() => {
    const fetchFeatured = async () => {
      setProductsLoading(true)
      try {
        const res = await fetch("/api/customer/products?limit=8")
        if (!res.ok) throw new Error("Failed to fetch featured products")
        const data = await res.json()

        if (data.success && data.products) {
          const mapped = data.products.map(p => ({
            // Pass complete product data for quick view modal first
            ...p,
            id: p._id,
            title: p.name,
            brand: (p.brand && p.brand.name) || (typeof p.brand === 'string' ? p.brand : 'SWAY'),
            price: p.price,
            originalPrice: p.originalPrice,
            image: (p.thumbnail && p.thumbnail.HD) || (p.images && p.images[0] && p.images[0].HD) || '/placeholder.svg',
            sizes: p.sizes || [],
            colors: p.colors || [],
            rating: p.ratings || 0,
            reviews: p.numReviews || 0,
            isSponsored: !!p.isFeatured,
            inStock: p.inStock !== false,
          }))
          setFeaturedProducts(mapped)
        }
      } catch (err) {
        console.error("Error fetching featured products", err)
      } finally {
        setProductsLoading(false)
      }
    }
    fetchFeatured()
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

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleAddToCart = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()

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

    // If product requires size/color selection, redirect to product details page
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      window.location.href = `/productDetails/${product.id}`
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
          productId: product.id,
          quantity: 1,
          size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
          color: product.colors && product.colors.length > 0 ? product.colors[0] : null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to add item to cart", "error")
      } else {
        updateCartCount()
        showToast("Added to cart", "success")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      showToast("An error occurred while adding to cart", "error")
    }
  }

  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      showToast("Please log in to use wishlist", "info")
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      const method = wishlist.has(productId) ? "DELETE" : "POST"

      const res = await fetch("/api/customer/wishlist", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (res.ok) {
        setWishlist(prev => {
          const next = new Set(prev)
          if (next.has(productId)) {
            next.delete(productId)
            showToast("Removed from wishlist", "info")
          } else {
            next.add(productId)
            showToast("Added to wishlist", "success")
          }
          return next
        })
      }
    } catch (error) {
      console.error("Wishlist toggle error", error)
      showToast("Failed to update wishlist", "error")
    }
  }


  const promotions = [
    {
      id: 1,
      title: "Summer Sale",
      description: "Up to 50% off on selected items",
      image: "/summer_sale.jpg",
      cta: "Shop Now",
    },
    {
      id: 2,
      title: "New Arrivals",
      description: "Fresh styles just dropped",
      image: "/new_arrival2.jpg",
      cta: "Explore",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Header */}
      <header
        className={`relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-1000 ease-out ${headerLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <img src="/logo.png" alt="SWAY Logo" className="h-[24px] w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12 absolute left-[46%] transform -translate-x-1/2">
              <Link href="/" className="text-gray-900 hover:text-yellow-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-yellow-600">
                Products
              </Link>
              <Link href="/brands" className="text-gray-600 hover:text-yellow-600">
                Brands
              </Link>
              <Link href="/swipe" className="text-gray-600 hover:text-yellow-600">
                Swipe Shop
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">


              {/* Wishlist */}
              <Link href="/customerDashboard" className="p-2 text-gray-600 hover:text-yellow-600 transition-colors">
                <Heart className="w-6 h-6" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="p-2 text-gray-600 hover:text-yellow-600 transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Buttons */}
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-black"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out rounded-bl-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col h-full bg-white">
                <div className="flex-1 px-4 py-6 space-y-1 bg-white">
                  <Link
                    href="/"
                    className="flex items-center px-3 py-3 text-gray-900 font-semibold hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Home</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Products</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </Link>
                  <Link
                    href="/brands"
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Brands</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </Link>
                  <Link
                    href="/swipe"
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Swipe Shop</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </Link>


                </div>

                {/* Bottom Section - Auth Buttons */}
                {!user && (
                  <div className="p-4 border-t border-gray-200 bg-white rounded-bl-2xl">
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 w-full">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center font-semibold px-2 py-3 text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-lg transition-all"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 text-center font-semibold bg-yellow-400 text-black py-3 px-2 rounded-lg shadow-sm hover:bg-yellow-500 transition-all ml-1"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Animated Background Image */}
        <div
          className={`absolute inset-0 transition-all duration-1500 ease-out ${heroInView ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
            }`}
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asset2.343Z-6wjTf9OpPxdbfCu0pZDKVMo2bsQbKF.png"
            alt="Fashion model in yellow hoodie"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        {/* Animated Social Media Icons - Left Side */}
        <div
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col space-y-4 transition-all duration-1200 ease-out ${heroInView ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
            }`}
        >
          {[
            { label: "IG", delay: "delay-200" },
            { label: "X", delay: "delay-300", isX: true },
            { label: "FB", delay: "delay-400" },
            { label: "LI", delay: "delay-500" },
          ].map((social, index) => (
            <div
              key={social.label}
              className={`w-12 h-12 ${social.isX ? "bg-yellow-400" : "bg-white/90"} rounded-full flex items-center justify-center hover:bg-yellow-400 transition-all duration-300 cursor-pointer transform hover:scale-110 ${heroInView ? social.delay : ""}`}
            >
              {social.isX ? (
                <X className="w-5 h-5 text-black" />
              ) : (
                <span className="text-black font-bold">{social.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Animated Hero Content */}
        <div
          className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full transition-all duration-1000 ease-out ${heroInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
        >
          <div className="max-w-2xl">
            {/* Style Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              {["Stylish", "Fashion", "Modern"].map((tag, index) => (
                <span
                  key={tag}
                  className={`px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium transition-all duration-700 ease-out ${heroInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                  style={{ transitionDelay: heroInView ? `${600 + index * 100}ms` : "0ms" }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className={`text-4xl md:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-1000 ease-out ${heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              style={{ transitionDelay: heroInView ? "300ms" : "0ms" }}
            >
              Discover Fashion
              <br />
              Through <span className="text-yellow-400">Swipe</span>
            </h1>

            <p
              className={`text-lg text-white/90 mb-8 max-w-lg transition-all duration-1000 ease-out ${heroInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              style={{ transitionDelay: heroInView ? "400ms" : "0ms" }}
            >
              Experience fashion like never before. Swipe through curated styles, discover your perfect look, and shop
              from Pakistan&apos;s top brands - all in one place.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 ease-out ${heroInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              style={{ transitionDelay: heroInView ? "500ms" : "0ms" }}
            >
              <Link
                href="/swipe"
                className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 group"
              >
                Start Swiping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-colors text-center"
              >
                Join SWAY
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Rating Widget - Right Side */}
        <div
          className={`absolute right-12 top-1/3 z-20 hidden xl:block transition-all duration-1200 ease-out ${heroInView ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
            }`}
          style={{ transitionDelay: heroInView ? "800ms" : "0ms" }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-xs transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-bold text-black">4.8</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Happy Clients Score</p>
            <p className="text-xs text-gray-500">It&apos;s all about the shopping experience</p>

            {/* Small preview image */}
            <div className="mt-4 relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asset1-yDCzN4GGsiQtY5DrLsifRUR0vFK4da.webp"
                alt="Fashion preview"
                className="w-full h-[18rem] object-cover object-[center_5%] rounded-lg"
              />
              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-black" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Promotions Section */}
      <section
        ref={promotionsRef}
        className={`py-16 bg-gray-50 transition-all duration-1000 ease-out ${promotionsInView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 transition-all duration-800 ease-out ${promotionsInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            style={{ transitionDelay: promotionsInView ? "200ms" : "0ms" }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Promotions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don&apos;t miss out on our exclusive deals and latest collections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotions.map((promo, index) => (
              <div
                key={promo.id}
                className={`relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-700 ease-out group ${promotionsInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                style={{ transitionDelay: promotionsInView ? `${400 + index * 200}ms` : "0ms" }}
              >
                <img
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ objectPosition: "center 47%" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors">
                    {promo.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Guest Product Browsing Section */}
      <section
        ref={productsRef}
        className={`py-16 transition-all duration-1000 ease-out ${productsInView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-800 ease-out ${productsInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            style={{ transitionDelay: productsInView ? "200ms" : "0ms" }}
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Discover trending items from top brands</p>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-yellow-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Sponsored Products Banner */}
          <div
            className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 transition-all duration-700 ease-out ${productsInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            style={{ transitionDelay: productsInView ? "300ms" : "0ms" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Sponsored Products</span>
            </div>
            <p className="text-yellow-700 text-sm">Premium brands showcase their latest collections</p>
          </div>

          {/* Animated Product Grid */}
          {productsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                // Replace this section in your featuredProducts.map()
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product)
                    setIsProductModalOpen(true)
                  }}
                  className={`block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-700 ease-out overflow-hidden group cursor-pointer ${productsInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                  style={{ transitionDelay: productsInView ? `${500 + index * 100}ms` : "0ms" }}
                >
                  {/* Rest of your product card content remains the same */}
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Sponsored Badge */}
                    {product.isSponsored && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                        Sponsored
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, product.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${wishlist.has(product.id) ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"}`}
                    >
                      <Heart className="w-4 h-4" />
                    </button>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button className="bg-white text-black px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{product.brand}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            PKR {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full mt-3 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div
            className={`text-center mt-12 transition-all duration-700 ease-out ${productsInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            style={{ transitionDelay: productsInView ? "1100ms" : "0ms" }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Animated CTA Section */}
      <section
        ref={ctaRef}
        className={`py-16 bg-black text-white transition-all duration-1000 ease-out ${ctaInView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
      >
        <div
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-800 ease-out ${ctaInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          style={{ transitionDelay: ctaInView ? "200ms" : "0ms" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Style?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion enthusiasts who&apos;ve discovered their perfect style through SWAY&apos;s unique
            swipe experience.
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ease-out ${ctaInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            style={{ transitionDelay: ctaInView ? "400ms" : "0ms" }}
          >
            <Link
              href="/swipe"
              className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              Start Swiping Now
            </Link>
            <Link
              href="/signup"
              className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-semibold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)} />
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Brand Filter */}
              <div>
                <h3 className="font-semibold mb-3">Brands</h3>
                <div className="space-y-2">
                  {["Urban Style", "Street Wear", "Comfort Walk", "Elite Fashion"].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input type="checkbox" className="mr-3 rounded" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {["Tops", "Bottoms", "Shoes", "Accessories"].map((category) => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="mr-3 rounded" />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <input type="range" min="0" max="10000" className="w-full" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>PKR 0</span>
                  <span>PKR 10,000+</span>
                </div>
              </div>

              <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}
