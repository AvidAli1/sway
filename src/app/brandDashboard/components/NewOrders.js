"use client"

import { useState } from "react"
import { Eye, CheckCircle, Package } from "lucide-react"

export default function NewOrders() {
  // Mock new orders data
  const [orders] = useState([
    {
      id: "SW1001",
      customer: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+92 300 1234567",
      },
      items: [
        { name: "Premium Cotton Hoodie", quantity: 1, price: 4500 },
        { name: "Casual T-Shirt", quantity: 2, price: 2200 },
      ],
      total: 8900,
      orderDate: "2024-01-15T10:30:00Z",
      shippingAddress: "123 Main St, Karachi, Pakistan",
      paymentMethod: "Card",
      status: "new",
    },
    {
      id: "SW1002",
      customer: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+92 301 9876543",
      },
      items: [{ name: "Designer Jeans", quantity: 1, price: 5800 }],
      total: 5800,
      orderDate: "2024-01-15T09:15:00Z",
      shippingAddress: "456 Oak Ave, Lahore, Pakistan",
      paymentMethod: "COD",
      status: "new",
    },
    {
      id: "SW1003",
      customer: {
        name: "Mike Johnson",
        email: "mike@example.com",
        phone: "+92 302 5555555",
      },
      items: [
        { name: "Vintage Denim Jacket", quantity: 1, price: 6200 },
        { name: "Summer Dress", quantity: 1, price: 4200 },
      ],
      total: 10400,
      orderDate: "2024-01-15T08:45:00Z",
      shippingAddress: "789 Pine Rd, Islamabad, Pakistan",
      paymentMethod: "Card",
      status: "new",
    },
  ])

  const handleAcceptOrder = (orderId) => {
    console.log("Accepting order:", orderId)
    // In real app, this would update the order status via API
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Orders</h2>
            <p className="text-gray-600">Orders waiting for your confirmation</p>
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{orders.length} New</div>
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

                <div className="flex flex-col gap-3 lg:w-48">
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Order
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                    Decline
                  </button>
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
