"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Eye, Plus, Search, Package } from "lucide-react"
import Link from "next/link"

export default function ProductsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Products loaded from backend for this brand
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchProducts = async () => {
      setProductsLoading(true)
      setProductsError(null)
      try {
        // include auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        const res = await fetch('/api/brand/products', {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include',
        })

        if (!res.ok) throw new Error(`Failed to load products: ${res.status}`)

        const data = await res.json()
        if (!mounted) return

        if (data && Array.isArray(data.products)) {
          const normalized = data.products.map((p) => ({
            id: p._id,
            title: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            image: (p.thumbnail && p.thumbnail.SD) || (p.images && p.images[0] && p.images[0].SD) || '/placeholder.svg',
            category: p.category || '',
            stock: p.stock != null ? p.stock : (p.inStock ? 1 : 0),
            status: p.status || (p.inStock ? 'active' : 'out_of_stock'),
            sales: p.sales || 0,
            rating: p.ratings || 0,
            reviews: p.numReviews || 0,
            raw: p,
          }))
          setProducts(normalized)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error(err)
        if (mounted) setProductsError(err.message)
      } finally {
        if (mounted) setProductsLoading(false)
      }
    }

    fetchProducts()
    return () => { mounted = false }
  }, [])

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
            href="/uploadProduct"
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
        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading products: {productsError}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
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
              href="/uploadProduct"
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
