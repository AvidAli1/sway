"use client"

import { useState } from "react"
import { Edit, Trash2, Eye, Plus, Search, Package } from "lucide-react"
import Link from "next/link"

export default function ProductsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock products data - in real app, this would come from API
  const [products] = useState([
    {
      id: 1,
      title: "Premium Cotton Hoodie",
      price: 4500,
      originalPrice: 5500,
      image: "/placeholder.svg?height=200&width=200&text=Hoodie",
      category: "Hoodies",
      stock: 25,
      status: "active",
      sales: 45,
      rating: 4.8,
      reviews: 12,
    },
    {
      id: 2,
      title: "Vintage Denim Jacket",
      price: 6200,
      image: "/placeholder.svg?height=200&width=200&text=Jacket",
      category: "Jackets",
      stock: 15,
      status: "active",
      sales: 32,
      rating: 4.6,
      reviews: 8,
    },
    {
      id: 3,
      title: "Casual T-Shirt",
      price: 2200,
      image: "/placeholder.svg?height=200&width=200&text=T-Shirt",
      category: "T-Shirts",
      stock: 0,
      status: "out_of_stock",
      sales: 78,
      rating: 4.5,
      reviews: 23,
    },
    {
      id: 4,
      title: "Designer Jeans",
      price: 5800,
      image: "/placeholder.svg?height=200&width=200&text=Jeans",
      category: "Jeans",
      stock: 8,
      status: "low_stock",
      sales: 56,
      rating: 4.9,
      reviews: 15,
    },
    {
      id: 5,
      title: "Summer Dress",
      price: 4200,
      image: "/placeholder.svg?height=200&width=200&text=Dress",
      category: "Dresses",
      stock: 30,
      status: "active",
      sales: 23,
      rating: 4.4,
      reviews: 7,
    },
    {
      id: 6,
      title: "Leather Jacket",
      price: 8900,
      image: "/placeholder.svg?height=200&width=200&text=Leather",
      category: "Jackets",
      stock: 12,
      status: "active",
      sales: 18,
      rating: 4.7,
      reviews: 5,
    },
  ])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || product.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status, stock) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
      case "out_of_stock":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
      case "low_stock":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Link
            href="/productUpload"
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium w-fit"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">{getStatusBadge(product.status, product.stock)}</div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <span>Sales: {product.sales}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Rating: {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first product"}
            </p>
            <Link
              href="/productUpload"
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
