"use client"

import { useState } from "react"
import { X, ShoppingCart, Trash2, Eye } from "lucide-react"

export default function SwipeBucketModal({ isOpen, onClose, bucketItems, onAddToCart, onRemoveFromBucket }) {
  const [selectedProduct, setSelectedProduct] = useState(null)

  if (!isOpen) return null

  const handleAddToCart = (product) => {
    onAddToCart(product)
    onRemoveFromBucket(product.id)
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseProductView = () => {
    setSelectedProduct(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Swipe Bucket</h2>
              <p className="text-sm text-gray-600">{bucketItems.length} items to review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {bucketItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bucket is empty</h3>
              <p className="text-gray-600">Swipe right on products to add them here for review</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {bucketItems.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-xl p-4 flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-black">PKR {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="p-2 text-gray-600 hover:text-black hover:bg-white rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFromBucket(product.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {bucketItems.length > 0 && (
          <div className="border-t p-6">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  bucketItems.forEach((product) => {
                    onAddToCart(product)
                    onRemoveFromBucket(product.id)
                  })
                }}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Add All to Cart ({bucketItems.length})
              </button>
              <button
                onClick={() => {
                  bucketItems.forEach((product) => onRemoveFromBucket(product.id))
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseProductView} />
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold">Product Details</h3>
              <button onClick={handleCloseProductView}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-bold text-lg mb-2">{selectedProduct.title}</h3>
              <p className="text-gray-600 mb-2">{selectedProduct.brand}</p>
              <p className="text-gray-700 text-sm mb-4">{selectedProduct.description}</p>

              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">PKR {selectedProduct.price.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < Math.floor(selectedProduct.rating) ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({selectedProduct.rating})</span>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Available Colors:</p>
                <div className="flex gap-2">
                  {selectedProduct.colors.map((color) => (
                    <div
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 border-gray-300 ${
                        color === "black"
                          ? "bg-black"
                          : color === "white"
                            ? "bg-white"
                            : color === "grey"
                              ? "bg-gray-500"
                              : color === "blue"
                                ? "bg-blue-500"
                                : color === "yellow"
                                  ? "bg-yellow-400"
                                  : color === "brown"
                                    ? "bg-amber-600"
                                    : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Available Sizes:</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.sizes.map((size) => (
                    <span key={size} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
