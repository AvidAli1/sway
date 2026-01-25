"use client"

import { useState, useEffect } from "react"
import { Eye, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function DeliveredOrders() {
  const [timeFilter, setTimeFilter] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
        if (!token) {
          setError("Please log in to view orders")
          setLoading(false)
          return
        }

        const res = await fetch("/api/brand/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          next: { revalidate: 0 }
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.orders) {
            // Filter for delivered orders and transform data
            const deliveredOrders = data.orders
              .filter((order) => order.status === "delivered")
              .map((order) => transformOrder(order))
            setOrders(deliveredOrders)
          } else {
            setError(data.error || "Failed to load orders")
          }
        } else {
          const data = await res.json()
          setError(data.error || "Failed to load orders")
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError("An error occurred while loading orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const transformOrder = (order) => {
    // Format shipping address
    const shippingAddress = order.shippingAddress
      ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
      : "N/A"

    // Get delivered date from delivery.actualDelivery or status history
    const deliveredDate = order.delivery?.actualDelivery || order.statusHistory?.find((h) => h.status === "delivered")?.timestamp || null

    return {
      id: order.orderNumber,
      _id: order._id,
      customer: {
        name: order.customer?.name || "N/A",
        email: order.customer?.email || "N/A",
        phone: order.customer?.phone || "N/A",
      },
      items: order.items.map((item) => ({
        name: item.productSnapshot?.name || "Product",
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.brandSubtotal || order.total,
      orderDate: order.createdAt,
      deliveredDate,
      shippingAddress,
      paymentMethod: order.payment?.method?.replace("_", " ") || "N/A",
      status: order.status,
      trackingNumber: order.delivery?.trackingNumber || null,
      rating: null, // Reviews would come from a separate API
      review: null,
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400 text-sm">No rating yet</span>

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    )
  }

  const filteredOrders = orders.filter((order) => {
    if (!order.deliveredDate) return false
    const deliveredDate = new Date(order.deliveredDate)
    const now = new Date()
    const daysDiff = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24))

    switch (timeFilter) {
      case "week":
        return daysDiff <= 7
      case "month":
        return daysDiff <= 30
      case "quarter":
        return daysDiff <= 90
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delivered Orders</h2>
              <p className="text-gray-600">Successfully completed orders</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delivered Orders</h2>
              <p className="text-gray-600">Successfully completed orders</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading orders</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Delivered Orders</h2>
            <p className="text-gray-600">Successfully completed orders</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredOrders.length} Delivered
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-200">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id || order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Delivered
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                      <p className="text-sm text-gray-600">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">{order.customer.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                      <p className="text-sm text-gray-600">Ordered: {formatDate(order.orderDate)}</p>
                      {order.deliveredDate && (
                        <p className="text-sm text-gray-600">Delivered: {formatDate(order.deliveredDate)}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                      <p className="text-sm text-gray-600">Items: {order.items.length}</p>
                      <p className="text-sm text-gray-600">Total: PKR {order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items Delivered</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.rating && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Customer Feedback</h4>
                      {renderStars(order.rating)}
                      {order.review && <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{order.review}&rdquo;</p>}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:w-48 lg:self-start">
                  <Link
                    href={`/brandDashboard/orders/${order._id || order.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  {order.trackingNumber && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">Tracking: {order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No delivered orders</h3>
            <p className="text-gray-600">Completed orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
