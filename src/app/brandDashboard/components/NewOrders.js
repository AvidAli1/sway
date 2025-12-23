"use client"

import { useState, useEffect } from "react"
import { Eye, CheckCircle, Package } from "lucide-react"
import Link from "next/link"

export default function NewOrders() {
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
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.orders) {
            // Filter for pending orders and transform data
            const pendingOrders = data.orders
              .filter((order) => order.status === "pending")
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
      shippingAddress,
      paymentMethod: order.payment?.method?.replace("_", " ") || "N/A",
      status: order.status,
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">New Orders</h2>
              <p className="text-gray-600">Pending orders waiting for your confirmation</p>
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
              <h2 className="text-xl font-semibold text-gray-900">New Orders</h2>
              <p className="text-gray-600">Pending orders waiting for your confirmation</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
            <h2 className="text-xl font-semibold text-gray-900">New Orders</h2>
            <p className="text-gray-600">Pending orders waiting for your confirmation</p>
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{orders.length} New</div>
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
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      New Order
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                      <p className="text-sm text-gray-600">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">{order.customer.email}</p>
                      <p className="text-sm text-gray-600">{order.customer.phone}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <p className="text-sm text-gray-600">Date: {formatDate(order.orderDate)}</p>
                      <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
                      <p className="text-sm text-gray-600">Items: {order.items.length}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items Ordered</h4>
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
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No new orders</h3>
            <p className="text-gray-600">New orders will appear here when customers place them</p>
          </div>
        )}
      </div>
    </div>
  )
}
