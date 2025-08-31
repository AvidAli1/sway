"use client"

import { useState } from "react"
import { Eye, CheckCircle, X, RefreshCw } from "lucide-react"

export default function ReturnsRefunds() {
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock returns/refunds data
  const [returns] = useState([
    {
      id: "RET001",
      orderId: "SW1011",
      customer: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+92 300 1234567",
      },
      product: {
        name: "Premium Cotton Hoodie",
        image: "/placeholder.svg?height=60&width=60&text=Hoodie",
        price: 4500,
        quantity: 1,
      },
      reason: "Size too small",
      description:
        "The hoodie is smaller than expected. I ordered XL but it fits like L. Would like to exchange for XXL or get a refund.",
      requestDate: "2024-01-14T10:30:00Z",
      status: "pending",
      type: "exchange",
      images: [
        "/placeholder.svg?height=100&width=100&text=Photo1",
        "/placeholder.svg?height=100&width=100&text=Photo2",
      ],
    },
    {
      id: "RET002",
      orderId: "SW1012",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+92 301 9876543",
      },
      product: {
        name: "Designer Jeans",
        image: "/placeholder.svg?height=60&width=60&text=Jeans",
        price: 5800,
        quantity: 1,
      },
      reason: "Defective item",
      description:
        "There's a tear in the fabric near the pocket. The jeans arrived damaged and I would like a full refund.",
      requestDate: "2024-01-13T15:45:00Z",
      status: "approved",
      type: "refund",
      images: ["/placeholder.svg?height=100&width=100&text=Damage"],
    },
    {
      id: "RET003",
      orderId: "SW1013",
      customer: {
        name: "Ahmed Ali",
        email: "ahmed.ali@example.com",
        phone: "+92 302 5555555",
      },
      product: {
        name: "Casual T-Shirt",
        image: "/placeholder.svg?height=60&width=60&text=TShirt",
        price: 2200,
        quantity: 2,
      },
      reason: "Wrong color",
      description: "I ordered black t-shirts but received white ones. Need to exchange for the correct color.",
      requestDate: "2024-01-12T09:20:00Z",
      status: "processing",
      type: "exchange",
      images: ["/placeholder.svg?height=100&width=100&text=Wrong"],
    },
  ])

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
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Pending Review
          </span>
        )
      case "approved":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Approved</span>
      case "processing":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Processing</span>
      case "rejected":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Rejected</span>
      case "completed":
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  const getTypeIcon = (type) => {
    return type === "refund" ? (
      <span className="text-red-600">💰 Refund</span>
    ) : (
      <span className="text-blue-600">🔄 Exchange</span>
    )
  }

  const handleApprove = (returnId) => {
    console.log("Approving return:", returnId)
    // In real app, this would update the return status via API
  }

  const handleReject = (returnId) => {
    console.log("Rejecting return:", returnId)
    // In real app, this would update the return status via API
  }

  const filteredReturns = returns.filter((returnItem) => {
    if (statusFilter === "all") return true
    return returnItem.status === statusFilter
  })

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Returns & Refunds</h2>
            <p className="text-gray-600">Manage customer return and refund requests</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredReturns.filter((r) => r.status === "pending").length} Pending
            </div>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <div className="divide-y divide-gray-200">
        {filteredReturns.length > 0 ? (
          filteredReturns.map((returnItem) => (
            <div key={returnItem.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Return #{returnItem.id}</h3>
                    {getStatusBadge(returnItem.status)}
                    {getTypeIcon(returnItem.type)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                      <p className="text-sm text-gray-600">{returnItem.customer.name}</p>
                      <p className="text-sm text-gray-600">{returnItem.customer.email}</p>
                      <p className="text-sm text-gray-600">{returnItem.customer.phone}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                      <p className="text-sm text-gray-600">Order: #{returnItem.orderId}</p>
                      <p className="text-sm text-gray-600">Date: {formatDate(returnItem.requestDate)}</p>
                      <p className="text-sm text-gray-600">Reason: {returnItem.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={returnItem.product.image || "/placeholder.svg"}
                      alt={returnItem.product.name}
                      className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{returnItem.product.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {returnItem.product.quantity}</p>
                      <p className="text-sm text-gray-600">Price: PKR {returnItem.product.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Customer Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{returnItem.description}</p>
                  </div>

                  {returnItem.images && returnItem.images.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Attached Images</h4>
                      <div className="flex gap-2">
                        {returnItem.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Evidence ${index + 1}`}
                            className="w-20 h-20 rounded-lg bg-gray-100 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:w-48">
                  {returnItem.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(returnItem.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(returnItem.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      Total: PKR {(returnItem.product.price * returnItem.product.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600">
              {statusFilter !== "all"
                ? `No ${statusFilter} returns at the moment`
                : "Customer return requests will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
