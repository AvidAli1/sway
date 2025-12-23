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
  Save,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import ToastNotification from "../../../components/ToastNotification"

export default function BrandOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: "",
    note: "",
    trackingNumber: "",
    courierService: "",
    estimatedDelivery: "",
  })
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const getValidNextStatuses = (currentStatus) => {
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
      delivered: [],
      cancelled: [],
      returned: ["refunded"],
      refunded: [],
    }
    return validTransitions[currentStatus] || []
  }

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

        const res = await fetch(`/api/brand/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.order) {
            setOrder(data.order)
            // Initialize form with first valid next status
            const validNext = getValidNextStatuses(data.order.status)
            setStatusForm({
              status: validNext.length > 0 ? validNext[0] : "",
              note: data.order.notes?.brand || "",
              trackingNumber: data.order.delivery?.trackingNumber || "",
              courierService: data.order.delivery?.courierService || "",
              estimatedDelivery: data.order.delivery?.estimatedDelivery
                ? new Date(data.order.delivery.estimatedDelivery).toISOString().split("T")[0]
                : "",
            })
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

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token) {
        showToast("Please log in to update order status", "error")
        setIsUpdating(false)
        return
      }

      const body = {
        status: statusForm.status,
      }

      if (statusForm.note) body.note = statusForm.note
      if (statusForm.trackingNumber) body.trackingNumber = statusForm.trackingNumber
      if (statusForm.courierService) body.courierService = statusForm.courierService
      if (statusForm.estimatedDelivery) body.estimatedDelivery = statusForm.estimatedDelivery

      const res = await fetch(`/api/brand/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          showToast("Order status updated successfully", "info")
          setShowStatusForm(false)
          // Refresh order data
          const fetchOrder = async () => {
            const res = await fetch(`/api/brand/orders/${orderId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            if (res.ok) {
              const data = await res.json()
              if (data.success && data.order) {
                setOrder(data.order)
                const validNext = getValidNextStatuses(data.order.status)
                setStatusForm({
                  status: validNext.length > 0 ? validNext[0] : data.order.status,
                  note: data.order.notes?.brand || "",
                  trackingNumber: data.order.delivery?.trackingNumber || "",
                  courierService: data.order.delivery?.courierService || "",
                  estimatedDelivery: data.order.delivery?.estimatedDelivery
                    ? new Date(data.order.delivery.estimatedDelivery).toISOString().split("T")[0]
                    : "",
                })
              }
            }
          }
          fetchOrder()
        } else {
          showToast(data.error || "Failed to update order status", "error")
        }
      } else {
        const data = await res.json()
        showToast(data.error || "Failed to update order status", "error")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      showToast("An error occurred while updating order status", "error")
    } finally {
      setIsUpdating(false)
    }
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
      case "confirmed":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Confirmed
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
      case "out_for_delivery":
        return (
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Out for Delivery
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
                <Link href="/brandDashboard" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">Back</span>
                </Link>
                <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
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
              href="/brandDashboard"
              className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const validNextStatuses = getValidNextStatuses(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} type={toastType} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/brandDashboard" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back</span>
              </Link>
              <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
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
                    <span className="hidden md:block text-sm font-medium text-gray-900">{user.brand_name || user.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/brandDashboard"
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
              {validNextStatuses.length > 0 && (
                <button
                  onClick={() => setShowStatusForm(!showStatusForm)}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Status
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Update Form */}
        {showStatusForm && validNextStatuses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status * <span className="text-xs text-gray-500 font-normal">(Current: {order.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())})</span>
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                >
                  <option value="">Select new status...</option>
                  {validNextStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                <textarea
                  value={statusForm.note}
                  onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Add a note about this status update..."
                />
              </div>

              {(statusForm.status === "shipped" || statusForm.status === "out_for_delivery") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number (Optional)</label>
                    <input
                      type="text"
                      value={statusForm.trackingNumber}
                      onChange={(e) => setStatusForm({ ...statusForm, trackingNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Enter tracking number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Courier Service (Optional)</label>
                    <input
                      type="text"
                      value={statusForm.courierService}
                      onChange={(e) => setStatusForm({ ...statusForm, courierService: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="e.g., TCS Express, DHL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Date (Optional)</label>
                    <input
                      type="date"
                      value={statusForm.estimatedDelivery}
                      onChange={(e) => setStatusForm({ ...statusForm, estimatedDelivery: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? "Updating..." : "Update Status"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusForm(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

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
                      <p className="text-sm text-gray-600 mb-2">Brand: {item.productSnapshot?.brand?.name || "N/A"}</p>
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

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Customer Information</h2>
              </div>
              {order.customer && (
                <div className="text-gray-700">
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="mt-1 text-sm">{order.customer.email}</p>
                  <p className="text-sm">{order.customer.phone}</p>
                </div>
              )}
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
                          <span className="font-medium text-gray-900 capitalize">{status.status.replace("_", " ")}</span>
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
                  <span className="text-gray-900">PKR {order.brandSubtotal?.toLocaleString() || order.subtotal.toLocaleString()}</span>
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

              {/* Delivery Info */}
              {order.delivery && (order.delivery.trackingNumber || order.delivery.courierService || order.delivery.estimatedDelivery) && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">Delivery</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {order.delivery.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking:</span>
                        <span className="text-gray-900">{order.delivery.trackingNumber}</span>
                      </div>
                    )}
                    {order.delivery.courierService && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Courier:</span>
                        <span className="text-gray-900">{order.delivery.courierService}</span>
                      </div>
                    )}
                    {order.delivery.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Delivery:</span>
                        <span className="text-gray-900">{formatDate(order.delivery.estimatedDelivery)}</span>
                      </div>
                    )}
                    {order.delivery.actualDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered:</span>
                        <span className="text-gray-900">{formatDate(order.delivery.actualDelivery)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

