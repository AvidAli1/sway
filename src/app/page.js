"use client"

import { useState } from "react"
import { Search, ShoppingCart, Heart, Star, ArrowRight, Filter, X, Menu } from "lucide-react"
import Link from "next/link"
import LoginModal from "./components/LoginModal"

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [user, setUser] = useState(null)

  // Mock featured products data
  const featuredProducts = [
    {
      id: 1,
      title: "Premium Cotton Hoodie",
      brand: "Urban Style",
      price: 4500,
      originalPrice: 5500,
      image: "/placeholder.svg?height=300&width=250&text=Hoodie",
      rating: 4.8,
      isSponsored: true,
    },
    {
      id: 2,
      title: "Denim Jacket",
      brand: "Street Wear",
      price: 6200,
      image: "/placeholder.svg?height=300&width=250&text=Jacket",
      rating: 4.6,
      isSponsored: true,
    },
    {
      id: 3,
      title: "Casual Sneakers",
      brand: "Comfort Walk",
      price: 3800,
      image: "/placeholder.svg?height=300&width=250&text=Sneakers",
      rating: 4.7,
    },
    {
      id: 4,
      title: "Vintage T-Shirt",
      brand: "Retro Vibes",
      price: 2200,
      image: "/placeholder.svg?height=300&width=250&text=T-Shirt",
      rating: 4.5,
    },
    {
      id: 5,
      title: "Designer Jeans",
      brand: "Elite Fashion",
      price: 5800,
      image: "/placeholder.svg?height=300&width=250&text=Jeans",
      rating: 4.9,
    },
    {
      id: 6,
      title: "Summer Dress",
      brand: "Chic Styles",
      price: 4200,
      image: "/placeholder.svg?height=300&width=250&text=Dress",
      rating: 4.4,
    },
  ]

  const promotions = [
    {
      id: 1,
      title: "Summer Sale",
      description: "Up to 50% off on selected items",
      image: "/placeholder.svg?height=200&width=400&text=Summer+Sale",
      cta: "Shop Now",
    },
    {
      id: 2,
      title: "New Arrivals",
      description: "Fresh styles just dropped",
      image: "/placeholder.svg?height=200&width=400&text=New+Arrivals",
      cta: "Explore",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">
                S<span className="text-yellow-400">W</span>AY
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-yellow-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-600 hover:text-yellow-600">
                Products
              </Link>
              <Link href="/brands" className="text-gray-600 hover:text-yellow-600">
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
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Wishlist */}
              <button className="p-2 text-gray-600 hover:text-yellow-600 transition-colors">
                <Heart className="w-6 h-6" />
              </button>

              {/* Cart */}
              <button className="p-2 text-gray-600 hover:text-yellow-600 transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  0
                </span>
              </button>

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-black">{user.name?.[0] || "U"}</span>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button onClick={() => setIsLoginOpen(true)} className="text-gray-600 hover:text-black font-medium">
                    Login
                  </button>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-500 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-4">
                <Link href="/" className="block py-2 text-gray-900 font-medium">
                  Home
                </Link>
                <Link href="/products" className="block py-2 text-gray-600">
                  Products
                </Link>
                <Link href="/brands" className="block py-2 text-gray-600">
                  Brands
                </Link>
                <Link href="/swipe" className="block py-2 text-gray-600">
                  Swipe Shop
                </Link>
                <div className="pt-4 border-t">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  {!user && (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setIsLoginOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full text-left py-2 text-gray-600"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setIsLoginOpen(true)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full bg-yellow-400 text-black py-2 rounded-lg font-medium"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asset2.343Z-6wjTf9OpPxdbfCu0pZDKVMo2bsQbKF.png"
            alt="Fashion model in yellow hoodie"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        {/* Social Media Icons - Left Side */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col space-y-4">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors cursor-pointer">
            <span className="text-black font-bold">IG</span>
          </div>
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors cursor-pointer">
            <X className="w-5 h-5 text-black" />
          </div>
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors cursor-pointer">
            <span className="text-black font-bold">FB</span>
          </div>
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors cursor-pointer">
            <span className="text-black font-bold">LI</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Style Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                Stylish
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                Fashion
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                Modern
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Fashion
              <br />
              Through <span className="text-yellow-400">Swipe</span>
            </h1>

            <p className="text-lg text-white/90 mb-8 max-w-lg">
              Experience fashion like never before. Swipe through curated styles, discover your perfect look, and shop
              from Pakistan&apos;s top brands - all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/swipe"
                className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 group"
              >
                Start Swiping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-colors"
              >
                Join SWAY
              </button>
            </div>
          </div>
        </div>

        {/* Rating Widget - Right Side */}
        <div className="absolute right-12 top-1/3 z-20 hidden xl:block">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-bold text-black">4.8</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Happy Clients Score</p>
            <p className="text-xs text-gray-500">It&apos;s all about the shopping experience</p>

            {/* Small preview image */}
            <div className="mt-4 relative">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asset1-yDCzN4GGsiQtY5DrLsifRUR0vFK4da.webp"
                alt="Fashion preview"
                className="w-full h-[18rem] object-cover object-[center_5%] rounded-lg"
              />
              <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-black" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Promotions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don&apos;t miss out on our exclusive deals and latest collections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <img
                  src={promo.image || "/placeholder.svg"}
                  alt={promo.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-white/90 mb-4">{promo.description}</p>
                  <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors">
                    {promo.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Product Browsing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Discover trending items from top brands</p>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-yellow-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Sponsored Products Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Sponsored Products</span>
            </div>
            <p className="text-yellow-700 text-sm">Premium brands showcase their latest collections</p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Sponsored Badge */}
                  {product.isSponsored && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      Sponsored
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button className="bg-white text-black px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{product.brand}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button className="w-full mt-3 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Style?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion enthusiasts who&apos;ve discovered their perfect style through SWAY&apos;s unique swipe
            experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/swipe"
              className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              Start Swiping Now
            </Link>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-semibold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)} />
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Brand Filter */}
              <div>
                <h3 className="font-semibold mb-3">Brands</h3>
                <div className="space-y-2">
                  {["Urban Style", "Street Wear", "Comfort Walk", "Elite Fashion"].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input type="checkbox" className="mr-3 rounded" />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {["Tops", "Bottoms", "Shoes", "Accessories"].map((category) => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="mr-3 rounded" />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <input type="range" min="0" max="10000" className="w-full" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>PKR 0</span>
                  <span>PKR 10,000+</span>
                </div>
              </div>

              <button className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={setUser} />
    </div>
  )
}
