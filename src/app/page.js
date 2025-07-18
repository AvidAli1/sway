"use client"

import { useState } from "react"
import Header from "./components/Header"
import SwipeInterface from "./components/SwipeInterface"
import ProductGrid from "./components/ProductGrid"
import LoginModal from "./components/LoginModal"
import { Filter, X } from "lucide-react"

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [viewMode, setViewMode] = useState("swipe") // 'swipe' or 'grid'
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Mock products data
  const [products] = useState([
    {
      id: 1,
      title: "Premium Cotton T-Shirt",
      brand: "Urban Style",
      price: 2500,
      image: "/placeholder.svg?height=400&width=300",
      category: "tops",
      size: ["S", "M", "L", "XL"],
      colors: ["black", "white", "grey"],
    },
    {
      id: 2,
      title: "Denim Jacket",
      brand: "Street Wear",
      price: 4500,
      image: "/placeholder.svg?height=400&width=300",
      category: "jackets",
      size: ["M", "L", "XL"],
      colors: ["blue", "black"],
    },
    {
      id: 3,
      title: "Casual Sneakers",
      brand: "Comfort Walk",
      price: 3200,
      image: "/placeholder.svg?height=400&width=300",
      category: "shoes",
      size: ["7", "8", "9", "10", "11"],
      colors: ["white", "black", "grey"],
    },
  ])

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1)
    // Add cart logic here
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        cartCount={cartCount}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {/* Mobile Filter Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ${isFilterOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <FilterSidebar />
      </div>

      {/* Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
      )}

      <div className="flex">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 bg-gray-50 min-h-screen border-r">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden p-4 border-b bg-white sticky top-16 z-30">
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 text-gray-700">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {viewMode === "swipe" ? (
              <SwipeInterface products={products} onAddToCart={handleAddToCart} />
            ) : (
              <ProductGrid products={products} onAddToCart={handleAddToCart} />
            )}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={setUser} />
    </div>
  )
}

function FilterSidebar() {
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    priceRange: [0, 10000],
    sizes: [],
    colors: [],
  })

  const brands = ["Urban Style", "Street Wear", "Comfort Walk", "Elite Fashion"]
  const categories = ["tops", "jackets", "jeans", "shoes", "accessories"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]
  const colors = ["black", "white", "grey", "blue", "red", "yellow"]

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input type="range" min="0" max="10000" className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>PKR 0</span>
            <span>PKR 10,000+</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <label key={size} className="flex items-center">
              <input type="checkbox" className="mr-1" />
              <span className="text-sm">{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <label key={color} className="flex items-center">
              <input type="checkbox" className="mr-1" />
              <div
                className={`w-4 h-4 rounded-full border bg-${color === "white" ? "white border-gray-300" : color === "black" ? "black" : color === "grey" ? "gray-500" : color === "blue" ? "blue-500" : color === "red" ? "red-500" : "yellow-500"}`}
              ></div>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
        Apply Filters
      </button>
    </div>
  )
}
