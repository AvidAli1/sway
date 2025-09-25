"use client"

import { useState } from "react"
import { Package, Truck, CheckCircle, Clock, Eye, Star, RotateCcw } from "lucide-react"

export default function OrderHistory() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")

  // Mock order data
  const [orders] = useState([
    {
      id: "SW2001",
      date: "2024-01-15T10:30:00Z",
      status: "delivered",
      total: 8900,
      items: [
        { name: "Premium Cotton Hoodie", quantity: 1, price: 4500, image: "/products_page/premium_hoodie.jpg" },
        { name: "Casual T-Shirt", quantity: 2, price: 2200, image: "/products_page/oversized_tshirt.jpg" },
      ],
      trackingNumber: "TRK123456789",
      deliveredDate: "2024-01-18T14:20:00Z",
      canReview: true,
      canReturn: true,
    },
    {
      id: "SW2002",
      date: "2024-01-12T15:45:00Z",
      status: "shipped",
      total: 5800,
      items: [{ name: "Designer Jeans", quantity: 1, price: 5800, image: "/landing_page_products/designer_jeans.jpg" }],
      trackingNumber: "TRK987654321",
      estimatedDelivery: "2024-01-20T12:00:00Z",
      canReview: false,
      canReturn: false,
    },
    {
      id: "SW2003",
      date: "2024-01-10T09:15:00Z",
      status: "processing",
      total: 10400,
      items: [
        { name: "Vintage Denim Jacket", quantity: 1, price: 6200, image: "/products_page/vintage_denim_jacket.jpg" },
        { name: "Summer Dress", quantity: 1, price: 4200, image: "/products_page/summer_floral_dress.jpg" },
      ],
      trackingNumber: null,
      canReview: false,
      canReturn: false,
    },
    {
      id: "SW2004",
      date: "2024-01-05T11:30:00Z",
      status: "delivered",
      total: 6400,
      items: [
        { name: "Graphic Print Hoodie", quantity: 1, price: 6400, image: "/products_page/graphic_print_hoodie.jpg" },
      ],
      trackingNumber: "TRK456789123",
      deliveredDate: "2024-01-08T16:45:00Z",
      canReview: true,
      canReturn: false,
      rating: 5,
    },
  ])

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
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  const filteredOrders = orders.filter((order) => {
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
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
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
        {filteredOrders.length > 0 ? (
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
                        <p className="text-sm text-gray-600">Delivered: {formatDate(order.deliveredDate)}</p>
                      )}
                      {order.estimatedDelivery && (
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
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>

                  {order.trackingNumber && (
                    <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" />
                      Track Order
                    </button>
                  )}

                  {order.canReview && !order.rating && (
                    <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2">
                      <Star className="w-4 h-4" />
                      Write Review
                    </button>
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
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
