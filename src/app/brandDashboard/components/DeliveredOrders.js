"use client"

import { useState } from "react"
import { Eye, CheckCircle, Star } from "lucide-react"

export default function DeliveredOrders() {
  const [timeFilter, setTimeFilter] = useState("all")

  // Mock delivered orders data
  const [orders] = useState([
    {
      id: "SW1006",
      customer: {
        name: "Emma Brown",
        email: "emma@example.com",
        phone: "+92 305 3333333",
      },
      items: [
        { name: "Summer Dress", quantity: 1, price: 4200 },
        { name: "Casual T-Shirt", quantity: 1, price: 2200 },
      ],
      total: 6400,
      orderDate: "2024-01-10T09:30:00Z",
      deliveredDate: "2024-01-13T16:45:00Z",
      shippingAddress: "987 Oak St, Karachi, Pakistan",
      paymentMethod: "Card",
      status: "delivered",
      trackingNumber: "TRK123456789",
      rating: 5,
      review: "Great quality products! Fast delivery.",
    },
    {
      id: "SW1007",
      customer: {
        name: "Hassan Khan",
        email: "hassan@example.com",
        phone: "+92 306 4444444",
      },
      items: [{ name: "Designer Jeans", quantity: 1, price: 5800 }],
      total: 5800,
      orderDate: "2024-01-08T14:20:00Z",
      deliveredDate: "2024-01-12T11:30:00Z",
      shippingAddress: "456 Pine Ave, Lahore, Pakistan",
      paymentMethod: "COD",
      status: "delivered",
      trackingNumber: "TRK987654321",
      rating: 4,
      review: "Good fit, exactly as described.",
    },
    {
      id: "SW1008",
      customer: {
        name: "Fatima Ali",
        email: "fatima@example.com",
        phone: "+92 307 5555555",
      },
      items: [{ name: "Premium Cotton Hoodie", quantity: 2, price: 4500 }],
      total: 9000,
      orderDate: "2024-01-05T10:15:00Z",
      deliveredDate: "2024-01-09T14:20:00Z",
      shippingAddress: "123 Elm Rd, Islamabad, Pakistan",
      paymentMethod: "Card",
      status: "delivered",
      trackingNumber: "TRK456789123",
      rating: null,
      review: null,
    },
  ])

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
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
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
                      <p className="text-sm text-gray-600">Delivered: {formatDate(order.deliveredDate)}</p>
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

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Customer Feedback</h4>
                    {renderStars(order.rating)}
                    {order.review && <p className="text-sm text-gray-600 mt-2 italic">"{order.review}"</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-48">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <div className="text-center">
                    <span className="text-xs text-gray-500">Tracking: {order.trackingNumber}</span>
                  </div>
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
