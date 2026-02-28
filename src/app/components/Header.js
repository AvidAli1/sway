"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Heart, Grid, Layers, User, ChevronDown, LayoutDashboard, LogOut, Menu, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "../context/CartContext"

export default function Header({ user, onLoginClick, onViewModeChange, viewMode }) {
  const router = useRouter()
  const { cartCount } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back Button & Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mr-4 transform translate-y-0.5">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium pr-2">Back</span>
              </Link>
              <Link href="/">
                <img src="/logo.png" alt="SWAY Logo" className="h-[24px] w-auto" />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-yellow-600 font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-yellow-600">
              Products
            </Link>
            <Link href="/brands" className="text-gray-900 hover:text-yellow-600 font-medium">
              Brands
            </Link>
            <Link href="/swipe" className="text-gray-600 hover:text-yellow-600">
              Swipe Shop
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop */}
            <div className="hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Wishlist */}
            <Link href="/customerDashboard" className="p-2 text-gray-600 hover:text-yellow-600 transition-colors">
              <Heart className="w-6 h-6" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="p-2 text-gray-600 hover:text-yellow-600 transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 transition-colors bg-transparent"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-900">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href={user.role === "brand" ? "/brandDashboard" : "/customerDashboard"}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-yellow-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center bg-gray-100/80 backdrop-blur-sm p-1 rounded-full border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
                <Link href="/login" onClick={onLoginClick} className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-full transition-all">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-yellow-400 text-black px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm hover:bg-yellow-500 transition-all ml-1"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-black"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out rounded-bl-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col h-full bg-white">
              <div className="flex-1 px-4 py-6 space-y-1 bg-white">
                <Link
                  href="/"
                  className="flex items-center px-3 py-3 text-gray-900 font-semibold hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Home</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Products</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </Link>
                <Link
                  href="/brands"
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Brands</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </Link>
                <Link
                  href="/swipe"
                  className="flex items-center px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 group bg-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Swipe Shop</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </Link>
              </div>

              {/* Bottom Section - Auth Buttons */}
              {!user && (
                <div className="p-4 border-t border-gray-200 bg-white rounded-bl-2xl">
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 w-full">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center font-semibold px-2 py-3 text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-lg transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center font-semibold bg-yellow-400 text-black py-3 px-2 rounded-lg shadow-sm hover:bg-yellow-500 transition-all ml-1"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

