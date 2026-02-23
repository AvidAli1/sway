"use client"

import { useState, useEffect } from "react"
import { Heart, ShoppingCart, Trash2, Eye, Filter, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import ToastNotification from "../../components/ToastNotification"
import ProductQuickViewModal from "../../swipe/components/ProductQuickViewModal"
import { useCart } from "../../context/CartContext"

export default function Wishlist({ user }) {
  const { updateCartCount, cartProductIds } = useCart()
  const router = useRouter()
  const [sortBy, setSortBy] = useState("recent")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [wishlistItems, setWishlistItems] = useState([])


  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (user && (user._id || user.id)) {
      const uId = user._id || user.id
      fetch(`/api/customer/wishlist?userId=${uId}`)
        .then(res => res.json())
        .then(data => {
          if (data.wishlist) {
            const items = data.wishlist
              .filter(item => typeof item === 'object')
              .map(item => ({
                id: item._id,
                name: item.name,
                brand: item.brand?.name || "Brand",
                price: item.price,
                originalPrice: item.originalPrice,
                image: item.thumbnail?.SD || item.images?.[0]?.SD || "/placeholder.svg",
                category: item.category,
                inStock: item.inStock,
                addedDate: item.createdAt || new Date().toISOString(),
                rating: item.ratings || 0,
                reviews: item.numReviews || 0
              }))
            setWishlistItems(items)
          }
        })
        .catch(e => console.error("Wishlist fetch error", e))
    }
  }, [user])

  const handleRemoveFromWishlist = async (itemId) => {
    setWishlistItems((items) => items.filter((item) => item.id !== itemId))

    if (user) {
      try {
        const uId = user._id || user.id
        await fetch('/api/customer/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId, productId: itemId })
        })
        showToast("Removed from wishlist", "success")
      } catch (e) {
        console.error("Remove failed", e)
      }
    }
  }

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleAddToCart = async (e, item, options = {}) => {
    e.stopPropagation()

    if (!user) {
      showToast("Please login first", "error")
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/customer/cart', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: item.id,
          quantity: 1,
          size: options.selectedSize || undefined,
          color: options.selectedColor || undefined
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        updateCartCount()
      } else {
        // Only show error toasts, not success (success changes button state)
        showToast(data.error || "Failed to add to cart", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("Error adding to cart", "error")
    }
  }

  const handleQuickView = (e, item) => {
    e.stopPropagation()
    setSelectedProduct({
      ...item,
      title: item.name,
      images: [item.image]
    })
    setIsModalOpen(true)
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />

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
                onClick={() => router.push(`/productDetails/${item.id}`)}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromWishlist(item.id); }}
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
                      {item.originalPrice > item.price && (
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
                      cartProductIds?.has(item.id) ? (
                        <button
                          disabled
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1 font-medium cursor-default transition-all duration-200"
                        >
                          <Check className="w-4 h-4" />
                          Added to Cart
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          className="flex-1 bg-yellow-400 text-black py-2 px-3 rounded text-sm hover:bg-yellow-500 transition-colors flex items-center justify-center gap-1 font-medium"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 py-2 px-3 rounded text-sm cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Out of Stock
                      </button>
                    )}
                    <button
                      onClick={(e) => handleQuickView(e, item)}
                      className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFromWishlist(item.id); }}
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

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          isAdded={cartProductIds?.has(selectedProduct?.id)}
          onAddToCart={(prodWithOptions) => {
            handleAddToCart({ stopPropagation: () => { } }, selectedProduct, prodWithOptions)
          }}
        />
      )}
    </div>
  )
}
