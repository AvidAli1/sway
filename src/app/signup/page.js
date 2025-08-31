"use client"

import { useState } from "react"
import {
  Eye,
  EyeOff,
  User,
  Store,
  Mail,
  Lock,
  Phone,
  MapPin,
  Upload,
  Globe,
  Facebook,
  Instagram,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Users table fields
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    profile_image: null,
    role: "customer",

    // Brands table fields (for shop owners)
    brand_name: "",
    description: "",
    logo: null,
    facebook: "",
    instagram: "",
    website: "",
  })

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }))
  }

  const handleUserTypeChange = (type) => {
    setUserType(type)
    setFormData((prev) => ({
      ...prev,
      role: type === "brand" ? "brand" : "customer",
    }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      return false
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long!")
      return false
    }
    if (userType === "brand" && !formData.brand_name.trim()) {
      alert("Brand name is required for shop registration!")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Prepare data according to database schema
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        profile_image: formData.profile_image,
        role: formData.role,
      }

      let brandData = null
      if (userType === "brand") {
        brandData = {
          brand_name: formData.brand_name,
          description: formData.description,
          logo: formData.logo,
          verified: false,
          facebook: formData.facebook,
          instagram: formData.instagram,
          website: formData.website,
        }
      }

      // In a real app, you would make API calls here
      console.log("User Data:", userData)
      if (brandData) console.log("Brand Data:", brandData)

      // Mock successful registration
      const user = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(userType === "brand" && { brand_name: formData.brand_name }),
      }

      localStorage.setItem("user", JSON.stringify(user))

      // Redirect based on user type
      if (userType === "brand") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Signup error:", error)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold text-black absolute left-[48%] sm:left-[50%] transform -translate-x-1/2">
            S<span className="text-yellow-400">W</span>AY
          </h1>

          {/* Login/Signup Toggle - Responsive */}
          <div className="flex justify-center">
            <div className="flex flex-col sm:flex-row bg-gray-100 rounded-lg p-1 w-20 sm:w-60">
              <Link
                href="/login"
                className="flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap text-gray-600 hover:text-gray-900 text-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap bg-white text-gray-900 shadow-sm text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive spacing */}
      <div className="px-4 sm:px-6">
        <div className="w-full max-w-2xl mx-auto pt-16 sm:pt-32 pb-16 sm:pb-40">
          {/* Auth Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Join SWAY</h2>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">I want to join as:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleUserTypeChange("customer")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  userType === "customer" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="w-6 h-6 mb-2 text-gray-600" />
                <div className="font-medium text-gray-900">Customer</div>
                <div className="text-sm text-gray-600">Shop and discover</div>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange("brand")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  userType === "brand" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Store className="w-6 h-6 mb-2 text-gray-600" />
                <div className="font-medium text-gray-900">Brand Owner</div>
                <div className="text-sm text-gray-600">Sell your products</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Email */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Basic User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {userType === "brand" ? "Contact Person Name *" : "Full Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder={userType === "brand" ? "Contact person name" : "Your full name"}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  placeholder="Your complete address"
                  required
                />
              </div>
            </div>

            {/* Profile Image */}
            <div>
              <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Brand Specific Fields */}
            {userType === "brand" && (
              <>
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Brand Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Brand Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Name *
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="brand_name"
                          name="brand_name"
                          value={formData.brand_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Your brand name"
                          required
                        />
                      </div>
                    </div>

                    {/* Brand Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                        placeholder="Tell us about your brand..."
                      />
                    </div>

                    {/* Brand Logo */}
                    <div className="md:col-span-2">
                      <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Logo
                      </label>
                      <div className="relative">
                        <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="file"
                          id="logo"
                          name="logo"
                          onChange={handleInputChange}
                          accept="image/*"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="https://yourbrand.com"
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div>
                      <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook Page
                      </label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="facebook"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Your Facebook page URL"
                        />
                      </div>
                    </div>

                    {/* Instagram */}
                    <div className="md:col-span-2">
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram Handle
                      </label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="@yourbrand"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Partnership Benefits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Reach thousands of fashion enthusiasts</li>
                    <li>• Advanced analytics and insights</li>
                    <li>• Sponsored product placements</li>
                    <li>• Direct customer engagement</li>
                    <li>• Verification badge after approval</li>
                  </ul>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Create {userType === "brand" ? "Brand" : "Customer"} Account
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-yellow-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-yellow-600 hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
