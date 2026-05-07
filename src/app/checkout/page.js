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
  Lock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js"
import ToastNotification from "../components/ToastNotification"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)


function CheckoutInner() {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

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
  const [savedAddresses, setSavedAddresses] = useState([])
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
  const [cardError, setCardError] = useState("")
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
                  router.push("/cart")
                }
              }
            }
          }
        } else {
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

    if (!validateForm()) return
    if (cartItems.length === 0) {
      showToast("Your cart is empty", "error")
      return
    }

    setSubmitting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token && user) {
        showToast("Please log in to place an order", "error")
        setSubmitting(false)
        return
      }

      const items = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.selectedSize || null,
        color: item.selectedColor || null,
      }))

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

      let paymentInfo = { method: paymentMethod }

      // Handle Stripe card payment
      if (paymentMethod === "credit_card") {
        if (!stripe || !elements) {
          showToast("Payment system not ready. Please refresh and try again.", "error")
          setSubmitting(false)
          return
        }

        const cardElement = elements.getElement(CardNumberElement)
        if (!cardElement) {
          showToast("Please enter your card details", "error")
          setSubmitting(false)
          return
        }

        // Step 1: Create PaymentIntent on the server
        const intentRes = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: estimatedTotal }),
        })

        const intentData = await intentRes.json()
        if (!intentRes.ok || !intentData.clientSecret) {
          showToast(intentData.error || "Failed to initialize payment", "error")
          setSubmitting(false)
          return
        }

        // Step 2: Confirm card payment with Stripe.js (no redirect)
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
              },
            },
          }
        )

        if (stripeError) {
          showToast(stripeError.message || "Payment failed. Please try again.", "error")
          setSubmitting(false)
          return
        }

        if (paymentIntent.status !== "succeeded") {
          showToast("Payment was not completed. Please try again.", "error")
          setSubmitting(false)
          return
        }

        paymentInfo = {
          method: "credit_card",
          transactionId: paymentIntent.id,
          paymentGateway: "stripe",
          status: "completed",
        }
      }

      // Step 3: Create order (backend re-verifies the PaymentIntent for card payments)
      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          payment: paymentInfo,
          notes: notes.trim() || "",
          isGift: isGift || false,
          giftMessage: isGift ? giftMessage.trim() : "",
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        showToast("Order placed successfully!", "info")
        // Clear guest localStorage cart if applicable
        if (!user || user.role !== "customer") {
          localStorage.setItem("cart", JSON.stringify([]))
        }
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
                      <option value="office">Work / Office</option>
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
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "cash_on_delivery"
                      ? "border-yellow-400 bg-yellow-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === "cash_on_delivery"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                  />
                  {/* COD icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === "cash_on_delivery" ? "bg-yellow-400" : "bg-gray-100"
                  }`}>
                    <svg className={`w-5 h-5 ${paymentMethod === "cash_on_delivery" ? "text-black" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-500 mt-0.5">Pay in cash when your order arrives</div>
                  </div>
                  {paymentMethod === "cash_on_delivery" && (
                    <div className="ml-auto flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </label>

                {/* Credit / Debit Card */}
                <label
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "credit_card"
                      ? "border-yellow-400 bg-yellow-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                  />
                  {/* Card icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === "credit_card" ? "bg-yellow-400" : "bg-gray-100"
                  }`}>
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "credit_card" ? "text-black" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      Credit / Debit Card
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">Visa, Mastercard, Amex · Powered by Stripe</div>
                  </div>
                  {paymentMethod === "credit_card" && (
                    <div className="ml-auto flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </label>

                {/* Stripe Card Element */}
                {paymentMethod === "credit_card" && (
                  <div className="rounded-xl border-2 border-yellow-200 bg-gray-50 overflow-hidden">
                    {/* Card form header */}
                    <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Enter card details</span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Lock className="w-3 h-3" />
                        <span>SSL encrypted</span>
                      </div>
                    </div>

                    {/* Card input area */}
                    <div className="p-5 space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                        <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3.5 focus-within:border-yellow-400 transition-colors">
                          <CardNumberElement
                            options={{
                              style: {
                                base: {
                                  color: "#111827",
                                  fontFamily: "inherit",
                                  fontSmoothing: "antialiased",
                                  fontSize: "16px",
                                  "::placeholder": { color: "#9CA3AF" },
                                  iconColor: "#6B7280",
                                },
                                invalid: { color: "#EF4444", iconColor: "#EF4444" },
                              },
                              showIcon: true,
                            }}
                            onChange={(e) => setCardError(e.error?.message || "")}
                          />
                        </div>
                      </div>

                      {/* Expiry + CVC side by side */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                          <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3.5 focus-within:border-yellow-400 transition-colors">
                            <CardExpiryElement
                              options={{
                                style: {
                                  base: {
                                    color: "#111827",
                                    fontFamily: "inherit",
                                    fontSmoothing: "antialiased",
                                    fontSize: "16px",
                                    "::placeholder": { color: "#9CA3AF" },
                                  },
                                  invalid: { color: "#EF4444" },
                                },
                              }}
                              onChange={(e) => setCardError(e.error?.message || "")}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
                          <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3.5 focus-within:border-yellow-400 transition-colors">
                            <CardCvcElement
                              options={{
                                style: {
                                  base: {
                                    color: "#111827",
                                    fontFamily: "inherit",
                                    fontSmoothing: "antialiased",
                                    fontSize: "16px",
                                    "::placeholder": { color: "#9CA3AF" },
                                  },
                                  invalid: { color: "#EF4444" },
                                },
                              }}
                              onChange={(e) => setCardError(e.error?.message || "")}
                            />
                          </div>
                        </div>
                      </div>

                      {cardError && (
                        <p className="text-sm text-red-600 flex items-center gap-1.5">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {cardError}
                        </p>
                      )}
                    </div>

                    {/* Stripe branding footer */}
                    <div className="px-5 py-2.5 bg-white border-t border-gray-100 flex items-center justify-center gap-2">
                      <svg className="h-4" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10 10 0 01-4.56 1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.58zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V6.27h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 6.9-5.65 6.9zm-.96-10.49c-.97 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.05-3.84-2.54-3.84zM28.24 5.07a2.13 2.13 0 110-4.27 2.13 2.13 0 010 4.27zm-2.07 15.22V6.27h4.12v14.02h-4.12zM21.95 20.29c-1.97 0-3.15-.66-4.34-1.88l-.04 1.59H13.8V.1l4.1-.87.01 6.43a4.88 4.88 0 013.14-1.15c3.26 0 5.62 2.65 5.62 7.26 0 5.14-2.33 6.52-4.72 6.52zm-.9-10.59c-.9 0-1.51.33-1.96.78l.01 6.26c.41.46 1.01.79 1.95.79 1.5 0 2.5-1.56 2.5-3.92 0-2.28-1.01-3.91-2.5-3.91zM8.34 17.7c1.13 0 2.5-.38 2.5-1.71 0-1.46-2.05-1.82-3.96-2.82-2.14-1.12-3.35-2.62-3.35-4.86C3.53 5.1 5.98 3.6 9.21 3.6c1.63 0 3.26.37 4.57 1.08V8.5c-1.22-.72-2.74-1.2-4.26-1.2-1.22 0-2.35.4-2.35 1.57 0 1.31 1.62 1.69 3.35 2.55 2.33 1.17 3.97 2.59 3.97 5.17 0 3.4-2.73 4.98-6.1 4.98a12.07 12.07 0 01-5.09-1.1v-3.77c1.33.82 3.28 1.4 5.04 1.4z" fill="#635BFF"/>
                      </svg>
                      <span className="text-xs text-gray-400">Your payment info is never stored on our servers</span>
                    </div>
                  </div>
                )}
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
                disabled={submitting || cartItems.length === 0 || (paymentMethod === "credit_card" && !stripe)}
                className="w-full mt-6 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>{paymentMethod === "credit_card" ? "Processing Payment..." : "Placing Order..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{paymentMethod === "credit_card" ? "Pay & Place Order" : "Place Order"}</span>
                  </>
                )}
              </button>

              {paymentMethod === "credit_card" && (
                <p className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Your payment is encrypted and secure
                </p>
              )}
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

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  )
}
