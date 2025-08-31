"use client"

import { useState } from "react"
import { Eye, Truck, Clock } from "lucide-react"

export default function PendingOrders() {
  // Mock pending orders data
  const [orders] = useState([
    {
      id: "SW1004",
      customer: {
        name: "Sarah Wilson",
        email: "sarah@example.com",
        phone: "+92 303 1111111",
      },
      items: [{ name: "Leather Jacket", quantity: 1, price: 8900 }],
      total: 8900,
      orderDate: "2024-01-14T14:20:00Z",
      acceptedDate: "2024-01-14T15:30:00Z",
      shippingAddress: "321 Elm St, Karachi, Pakistan",
      paymentMethod: "Card",
      status: "processing",
      trackingNumber: null,
    },
    {
      id: "SW1005",
      customer: {
        name: "Ahmed Ali",
        email: "ahmed@example.com",
        phone: "+92 304 2222222",
      },
      items: [{ name: "Premium Cotton Hoodie", quantity: 2, price: 4500 }],
      total: 9000,
      orderDate: "2024-01-13T11:45:00Z",
      acceptedDate: "2024-01-13T12:00:00Z",
      shippingAddress: "654 Maple Dr, Lahore, Pakistan",
      paymentMethod: "COD",
      status: "preparing",
      trackingNumber: null,
    },
  ])

  const handleShipOrder = (orderId) => {
    console.log("Shipping order:", orderId)
    // In real app, this would update the order status and generate tracking
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
      case "processing":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Processing</span>
      case "preparing":
        return (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Preparing</span>
        )
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pending Orders</h2>
            <p className="text-gray-600">Orders being processed and prepared for shipping</p>
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
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

                <div className="flex flex-col gap-3 lg:w-48">
                  <button
                    onClick={() => handleShipOrder(order.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Truck className="w-4 h-4" />
                    Mark as Shipped
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
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
            <p className="text-gray-600">Orders you've accepted will appear here for processing</p>
          </div>
        )}
      </div>
    </div>
  )
}
