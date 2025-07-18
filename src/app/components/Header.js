"use client"

import { useState } from "react"
import { Search, ShoppingCart, Heart, Grid, Layers } from "lucide-react"

export default function Header({ user, onLoginClick, cartCount, onViewModeChange, viewMode }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-black">
              S<span className="text-yellow-400">W</span>AY
            </h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange("swipe")}
                className={`p-2 rounded ${viewMode === "swipe" ? "bg-yellow-400 text-black" : "text-gray-600 hover:text-black"}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-yellow-400 text-black" : "text-gray-600 hover:text-black"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Wishlist */}
            <button className="relative p-2 text-gray-600 hover:text-black">
              <Heart className="w-6 h-6" />
            </button>

            {/* Cart */}
            <button className="relative p-2 text-gray-600 hover:text-black">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">{user.name?.[0] || "U"}</span>
                </div>
                <span className="hidden md:block text-sm font-medium">{user.name}</span>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
