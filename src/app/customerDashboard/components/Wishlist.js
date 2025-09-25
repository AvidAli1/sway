"use client"
import { useState } from "react"
import { Heart, ShoppingCart, Trash2, Eye, Filter } from "lucide-react"

export default function Wishlist() {
  const [sortBy, setSortBy] = useState("recent")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Mock wishlist data
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Premium Cotton Hoodie",
      brand: "Urban Style",
      price: 4500,
      originalPrice: 5500,
      image: "/products_page/premium_hoodie.jpg",
      category: "Hoodies",
      inStock: true,
      addedDate: "2024-01-14T10:30:00Z",
      rating: 4.8,
      reviews: 12,
    },
    {
      id: 2,
      name: "Designer Jeans",
      brand: "Denim Co",
      price: 5800,
      image: "/landing_page_products/designer_jeans.jpg",
      category: "Jeans",
      inStock: true,
      addedDate: "2024-01-12T15:45:00Z",
      rating: 4.9,
      reviews: 15,
    },
    {
      id: 3,
      name: "Summer Dress",
      brand: "Floral Fashion",
      price: 4200,
      image: "/products_page/summer_floral_dress.jpg",
      category: "Dresses",
      inStock: false,
      addedDate: "2024-01-10T09:15:00Z",
      rating: 4.4,
      reviews: 7,
    },
    {
      id: 4,
      name: "Vintage Denim Jacket",
      brand: "Retro Wear",
      price: 6200,
      image: "/products_page/vintage_denim_jacket.jpg",
      category: "Jackets",
      inStock: true,
      addedDate: "2024-01-08T11:30:00Z",
      rating: 4.6,
      reviews: 8,
    },
  ])

  const handleRemoveFromWishlist = (itemId) => {
    setWishlistItems((items) => items.filter((item) => item.id !== itemId))
  }

  const handleAddToCart = (itemId) => {
    console.log("Adding to cart:", itemId)
    // In real app, this would add item to cart
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredAndSortedItems = wishlistItems
    .filter((item) => categoryFilter === "all" || item.category.toLowerCase() === categoryFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "recent":
        default:
          return new Date(b.addedDate) - new Date(a.addedDate)
      }
    })

  const categories = [...new Set(wishlistItems.map((item) => item.category))]

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
            <p className="text-gray-600">Items you've saved for later</p>
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {wishlistItems.length} Items
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="p-6">
        {filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">PKR {item.price.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          PKR {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <span>
                        ★ {item.rating} ({item.reviews})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Added {formatDate(item.addedDate)}</div>
                  </div>

                  <div className="flex gap-2">
                    {item.inStock ? (
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="flex-1 bg-yellow-400 text-black py-2 px-3 rounded text-sm hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1 font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 py-2 px-3 rounded text-sm cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Out of Stock
                      </button>
                    )}
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              {categoryFilter !== "all" ? "No items found in this category" : "Save items you love to your wishlist"}
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
