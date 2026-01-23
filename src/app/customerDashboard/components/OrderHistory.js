"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, Clock, Eye, Star, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReviewModal from "./ReviewModal"

export default function OrderHistory() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
        if (!token) {
          setLoading(false)
          return
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        })

        const res = await fetch(`/api/customer/orders?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.orders) {
            setOrders(data.orders)
            setPagination(data.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalOrders: data.orders.length,
              hasNextPage: false,
              hasPrevPage: false,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    fetchOrders()
  }, [currentPage])

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedReviewItem, setSelectedReviewItem] = useState(null)
  const [selectedReviewOrderId, setSelectedReviewOrderId] = useState(null)

  const handleOpenReview = (orderId, item) => {
    setSelectedReviewOrderId(orderId)
    setSelectedReviewItem(item)
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmit = async (reviewData) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    // Get user ID from local storage or decode token if needed
    // Ideally user ID should be in the session we can pass from parent or decode here
    // For now let's grab it from localStorage user object
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const userId = user.user ? user.user.id : user.id

    const res = await fetch("/api/customer/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...reviewData,
        userId,
      }),
    })

    if (!res.ok) {
      throw new Error("Failed to submit review")
    }

    // Update local state to hide the review button immediately
    setOrders(prevOrders => prevOrders.map(o => {
      if (o._id === selectedReviewOrderId || o.id === selectedReviewOrderId) {
        return { ...o, reviewStatus: 'reviewed' }
      }
      return o
    }))
  }

  // Transform API order data to match component structure
  const transformOrder = (order) => ({
    id: order.orderNumber,
    _id: order._id,
    date: order.createdAt,
    status: order.status,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.productSnapshot?.name || "Product",
      quantity: item.quantity,
      price: item.price,
      image: item.productSnapshot?.thumbnail?.SD || item.productSnapshot?.images?.[0]?.SD || "/placeholder.svg",
      size: item.size,
      color: item.color,
      itemId: item.product // Ensure we capture the product ID properly
    })),
    trackingNumber: order.delivery?.trackingNumber || order.trackingNumber || null,
    deliveredDate: order.delivery?.actualDelivery || order.statusHistory?.find((h) => h.status === "delivered")?.timestamp || null,
    estimatedDelivery: order.delivery?.estimatedDelivery || null,
    canReview: order.status === "delivered" && order.reviewStatus === "pending",
    reviewStatus: order.reviewStatus, // Pass it through
    canReturn: order.status === "delivered",
  })

  const transformedOrders = orders.map(transformOrder)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "processing":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        )
      case "shipped":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        )
      case "delivered":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        )
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Package className="w-3 h-3" />
            Cancelled
          </span>
        )
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium capitalize">{status}</span>
    }
  }

  const filteredOrders = transformedOrders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    const orderDate = new Date(order.date)
    const now = new Date()
    const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24))

    let matchesTime = true
    switch (timeFilter) {
      case "week":
        matchesTime = daysDiff <= 7
        break
      case "month":
        matchesTime = daysDiff <= 30
        break
      case "quarter":
        matchesTime = daysDiff <= 90
        break
    }

    return matchesStatus && matchesTime
  })

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Date: {formatDate(order.date)}</p>
                      {order.deliveredDate && (
                        <p className="text-sm text-gray-600">Delivery Date: {formatDate(order.deliveredDate)}</p>
                      )}
                      {!order.deliveredDate && order.estimatedDelivery && (
                        <p className="text-sm text-gray-600">Est. Delivery: {formatDate(order.estimatedDelivery)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total: PKR {order.total.toLocaleString()}</p>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-600">Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × PKR {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  <Link
                    href={`/customerDashboard/orders/${order._id || order.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>

                  {(order.status === "pending" || order.status === "processing" || order.status === "shipped" || order.trackingNumber) && (
                    <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" />
                      Track Order
                    </button>
                  )}

                  {order.status === "delivered" && (
                    <>
                      {order.reviewStatus === "reviewed" ? (
                        <button
                          disabled
                          className="bg-green-100 text-green-700 px-4 py-2 rounded-lg cursor-default flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Reviewed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReview(order._id, order.items[0])}
                          className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Leave a Review
                        </button>
                      )}
                    </>
                  )}

                  {order.canReturn && (
                    <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Return Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== "all" || timeFilter !== "all"
                ? "Try adjusting your filters"
                : "Start shopping to see your orders here"}
            </p>
            <Link
              href="/products"
              className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total orders)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}


      {selectedReviewItem && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          orderItem={selectedReviewItem}
          orderId={selectedReviewOrderId}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
