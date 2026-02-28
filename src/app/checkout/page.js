"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  MapPin,
  CreditCard,
  Gift,
  FileText,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ToastNotification from "../components/ToastNotification"

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [cartData, setCartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")

  // Form state
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([]) // Empty for now
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    landmark: "",
    addressType: "home",
  })
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery")
  const [notes, setNotes] = useState("")
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")

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

  // Load cart items
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)
      try {
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
                setCartData(data.cart)
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

                  // Pre-fill form with user data if available
                  if (user) {
                    setFormData((prev) => ({
                      ...prev,
                      email: user.email || "",
                      firstName: user.name?.split(" ")[0] || "",
                      lastName: user.name?.split(" ").slice(1).join(" ") || "",
                      phone: user.phone || "",
                    }))
                  }
                } else {
                  // Cart is empty, redirect to cart page
                  router.push("/cart")
                }
              }
            }
          }
        } else {
          // Guest user - load from localStorage
          const localCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
          if (localCart) {
            const parsed = JSON.parse(localCart)
            const sanitized = (Array.isArray(parsed) ? parsed : []).map((item) => ({
              ...item,
              brand: typeof item.brand === "string" ? item.brand : (item.brand?.name || "Brand"),
            }))
            setCartItems(sanitized)
            if (sanitized.length === 0) {
              router.push("/cart")
            }
          } else {
            router.push("/cart")
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user !== null) {
      loadCart()
    }
  }, [user, router])

  // Handle click outside dropdown
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
    router.push("/")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      showToast("First name is required", "error")
      return false
    }
    if (!formData.lastName.trim()) {
      showToast("Last name is required", "error")
      return false
    }
    if (!formData.email.trim()) {
      showToast("Email is required", "error")
      return false
    }
    if (!formData.phone.trim()) {
      showToast("Phone number is required", "error")
      return false
    }
    if (!formData.address.trim()) {
      showToast("Address is required", "error")
      return false
    }
    if (!formData.city.trim()) {
      showToast("City is required", "error")
      return false
    }
    if (!formData.state.trim()) {
      showToast("State is required", "error")
      return false
    }
    if (!formData.postalCode.trim()) {
      showToast("Postal code is required", "error")
      return false
    }
    if (!formData.country.trim()) {
      showToast("Country is required", "error")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (cartItems.length === 0) {
      showToast("Your cart is empty", "error")
      return
    }

    setSubmitting(true)

    try {
      // Prepare order items from cart
      const items = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.selectedSize || null,
        color: item.selectedColor || null,
      }))

      // Prepare shipping address
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        landmark: formData.landmark || "",
        addressType: formData.addressType,
      }

      // Prepare payment info
      const payment = {
        method: paymentMethod,
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token && user) {
        showToast("Please log in to place an order", "error")
        setSubmitting(false)
        return
      }

      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          payment,
          notes: notes.trim() || "",
          isGift: isGift || false,
          giftMessage: isGift ? giftMessage.trim() : "",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        showToast("Order placed successfully!", "info")
        // Clear cart
        if (user && user.role === "customer") {
          // Clear cart via API
          try {
            await fetch("/api/customer/cart", {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          } catch (e) {
            console.error("Failed to clear cart", e)
          }
        } else {
          // Clear localStorage for guest users
          localStorage.setItem("cart", JSON.stringify([]))
        }
        // Redirect to order confirmation or dashboard
        setTimeout(() => {
          router.push("/customerDashboard")
        }, 1500)
      } else {
        showToast(data.error || "Failed to place order", "error")
        setSubmitting(false)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      showToast("An error occurred while placing your order", "error")
      setSubmitting(false)
    }
  }

  // Calculate totals
  const subtotal = cartData?.subtotal ?? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalDiscount = cartData?.totalDiscount ?? cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  )
  const couponDiscount = cartData?.couponDiscount ?? 0
  const total = cartData?.total ?? (subtotal - couponDiscount)
  const estimatedShipping = cartData?.estimatedShipping ?? (subtotal >= 5000 ? 0 : 200)
  const estimatedTax = cartData?.estimatedTax ?? (subtotal * 0.08)
  const estimatedTotal = cartData?.estimatedTotal ?? (total + estimatedShipping + estimatedTax)

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
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors transform translate-y-0.5">
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
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        {user.email && <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>}
                      </div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              {/* Saved Addresses Toggle - Show even if empty for future implementation */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSavedAddress}
                    onChange={(e) => setUseSavedAddress(e.target.checked)}
                    disabled={savedAddresses.length === 0}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`text-sm font-medium ${savedAddresses.length === 0 ? "text-gray-400" : "text-gray-700"}`}>
                    Use saved address {savedAddresses.length === 0 && "(No saved addresses)"}
                  </span>
                </label>
              </div>

              {useSavedAddress && savedAddresses.length > 0 ? (
                <div className="space-y-4">
                  {savedAddresses.map((address) => (
                    <label
                      key={address._id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedAddressId === address._id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value={address._id}
                        checked={selectedAddressId === address._id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="font-medium text-gray-900">
                        {address.firstName} {address.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {address.address}, {address.city}, {address.state} {address.postalCode}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                    <select
                      name="addressType"
                      value={formData.addressType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Notes Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Order Notes</h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            {/* Gift Options Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Gift className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Gift Options</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700">This is a gift</span>
                </label>
                {isGift && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gift Message</label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write a gift message..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.itemId || item.id} className="flex gap-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-600">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && " • "}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        PKR {item.price.toLocaleString()} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">PKR {subtotal.toLocaleString()}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-PKR {totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coupon Discount</span>
                    <span className="text-green-600">-PKR {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {estimatedShipping === 0 ? "Free" : `PKR ${estimatedShipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">PKR {estimatedTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">PKR {estimatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className="w-full mt-6 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />
    </div>
  )
}

