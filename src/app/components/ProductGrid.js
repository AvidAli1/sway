"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import Image from 'next/image';

export default function ProductGrid({ products, onAddToCart }) {
  const [wishlist, setWishlist] = useState(new Set())

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev)
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId)
      } else {
        newWishlist.add(productId)
      }
      return newWishlist
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Product Image */}
          <div className="relative group">
            <div className="relative w-full h-64">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-full transition-colors ${wishlist.has(product.id) ? "bg-red-500 text-white" : "bg-white hover:bg-gray-100"
                    }`}
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Wishlist Button - Always Visible on Mobile */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-3 right-3 p-2 rounded-full sm:hidden ${wishlist.has(product.id) ? "bg-red-500 text-white" : "bg-white bg-opacity-80"
                }`}
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
              <p className="text-sm text-gray-600">{product.brand}</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-yellow-600">PKR {product.price.toLocaleString()}</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 3).map((color) => (
                  <div
                    key={color}
                    className={`w-4 h-4 rounded-full border ${color === "black"
                        ? "bg-black"
                        : color === "white"
                          ? "bg-white border-gray-300"
                          : color === "grey"
                            ? "bg-gray-500"
                            : color === "blue"
                              ? "bg-blue-500"
                              : color === "red"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                      }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
