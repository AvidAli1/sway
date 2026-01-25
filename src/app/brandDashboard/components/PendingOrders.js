"use client"

import { useState, useEffect } from "react"
import { Eye, Truck, Clock, CheckCircle, Package } from "lucide-react"
import Link from "next/link"

export default function PendingOrders() {
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
            // Filter for pending orders (confirmed, processing, shipped, out_for_delivery)
            const pendingStatuses = ["confirmed", "processing", "shipped", "out_for_delivery"]
            const pendingOrders = data.orders
              .filter((order) => pendingStatuses.includes(order.status))
              .map((order) => transformOrder(order))
            setOrders(pendingOrders)
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

    // Find accepted date from status history
    const acceptedStatus = order.statusHistory?.find((h) => h.status === "confirmed")
    const acceptedDate = acceptedStatus?.timestamp || order.createdAt

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
      acceptedDate,
      shippingAddress,
      paymentMethod: order.payment?.method?.replace("_", " ") || "N/A",
      status: order.status,
      trackingNumber: order.delivery?.trackingNumber || null,
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        )
      case "processing":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Package className="w-3 h-3" />
            Processing
          </span>
        )
      case "shipped":
        return (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        )
      case "out_for_delivery":
        return (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Out for Delivery
          </span>
        )
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium capitalize">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
              <p className="text-gray-600">Orders being processed and prepared for shipping</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
              <p className="text-gray-600">Orders being processed and prepared for shipping</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
            <p className="text-gray-600">Active orders: confirmed, processing, shipped, and out for delivery</p>
          </div>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.length} Pending
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-200">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id || order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                      <p className="text-sm text-gray-600">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">{order.customer.email}</p>
                      <p className="text-sm text-gray-600">{order.customer.phone}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                      <p className="text-sm text-gray-600">Ordered: {formatDate(order.orderDate)}</p>
                      <p className="text-sm text-gray-600">Accepted: {formatDate(order.acceptedDate)}</p>
                      <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total Amount</span>
                        <span className="text-lg">PKR {order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-48 lg:self-start">
                  <Link
                    href={`/brandDashboard/orders/${order._id || order.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 -mt-4" />
                      Processing since {formatDate(order.acceptedDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending orders</h3>
            <p className="text-gray-600">Active orders (confirmed, processing, shipped, out for delivery) will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
