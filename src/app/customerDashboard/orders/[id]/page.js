"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  FileText,
  Gift,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)

  // Load user
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

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
        if (!token) {
          setError("Please log in to view order details")
          setLoading(false)
          return
        }

        const res = await fetch(`/api/customer/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.order) {
            setOrder(data.order)
          } else {
            setError(data.error || "Order not found")
          }
        } else {
          const data = await res.json()
          setError(data.error || "Failed to load order")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("An error occurred while loading the order")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

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

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    setIsProfileDropdownOpen(false)
    router.push("/")
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        )
      case "processing":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Processing
          </span>
        )
      case "shipped":
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipped
          </span>
        )
      case "delivered":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered
          </span>
        )
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link href="/customerDashboard" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">Back</span>
                </Link>
                <Link href="/">
                  <img src="/logo.png" alt="SWAY Logo" className="h-[24px] w-auto" />
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The order you're looking for doesn't exist."}</p>
            <Link
              href="/customerDashboard"
              className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
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
              <Link
                href="/customerDashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
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
                      <Link
                        href="/customerDashboard"
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
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order {order.orderNumber}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items ({order.items.length})</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item._id || index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <img
                      src={item.productSnapshot?.thumbnail?.SD || item.productSnapshot?.images?.[0]?.SD || "/placeholder.svg"}
                      alt={item.productSnapshot?.name || "Product"}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.productSnapshot?.name || "Product"}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Brand: {item.productSnapshot?.brand?.name || "N/A"}
                      </p>
                      {(item.size || item.color) && (
                        <div className="flex gap-2 mb-2">
                          {item.size && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Size: {item.size}</span>
                          )}
                          {item.color && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Color: {item.color}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">PKR {item.price.toLocaleString()}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              PKR {item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>
              {order.shippingAddress && (
                <div className="text-gray-700">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="mt-1">{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="mt-1">{order.shippingAddress.country}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-gray-600 mt-1">Landmark: {order.shippingAddress.landmark}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">Phone: {order.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-600">Email: {order.shippingAddress.email}</p>
                </div>
              )}
            </div>

            {/* Order Notes */}
            {order.notes?.customer && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Order Notes</h2>
                </div>
                <p className="text-gray-700">{order.notes.customer}</p>
              </div>
            )}

            {/* Gift Message */}
            {order.isGift && order.giftMessage && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">Gift Message</h2>
                </div>
                <p className="text-gray-700">{order.giftMessage}</p>
              </div>
            )}

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status History</h2>
                <div className="space-y-3">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">{status.status}</span>
                          <span className="text-sm text-gray-500">{formatDate(status.timestamp)}</span>
                        </div>
                        {status.note && <p className="text-sm text-gray-600 mt-1">{status.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">PKR {order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-PKR {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {order.shippingCost === 0 ? "Free" : `PKR ${order.shippingCost.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">PKR {order.tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">PKR {order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Payment</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="text-gray-900 capitalize">{order.payment?.method?.replace("_", " ") || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-gray-900 capitalize">{order.payment?.status || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

