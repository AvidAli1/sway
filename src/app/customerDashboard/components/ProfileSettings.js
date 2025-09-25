"use client"

import { useState } from "react"
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X } from "lucide-react"

export default function ProfileSettings({ user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    city: user?.city || "",
    fashionStyle: user?.fashionStyle || "",
    favoriteColors: user?.favoriteColors || [],
    aesthetic: user?.aesthetic || "",
  })

  const handleSave = () => {
    // In real app, this would update user data via API
    console.log("Saving profile data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      city: user?.city || "",
      fashionStyle: user?.fashionStyle || "",
      favoriteColors: user?.favoriteColors || [],
      aesthetic: user?.aesthetic || "",
    })
    setIsEditing(false)
  }

  const fashionStyles = ["Casual", "Formal", "Desi", "Old Money", "Streetwear", "Minimalist", "Bohemian"]
  const aesthetics = ["Modern", "Vintage", "Classic", "Trendy", "Elegant", "Edgy", "Romantic"]
  const colors = ["Black", "White", "Grey", "Yellow", "Blue", "Red", "Green", "Pink", "Brown", "Navy"]

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  {formData.name || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {formData.email || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {formData.phone || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formData.dateOfBirth || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  {formData.gender || "Not provided"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2 text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {formData.city || "Not provided"}
                </div>
              )}
            </div>
          </div>

          {/* Fashion Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fashion Preferences</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fashion Style</label>
              {isEditing ? (
                <select
                  value={formData.fashionStyle}
                  onChange={(e) => setFormData({ ...formData, fashionStyle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Select Style</option>
                  {fashionStyles.map((style) => (
                    <option key={style} value={style.toLowerCase()}>
                      {style}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-900 capitalize">{formData.fashionStyle || "Not provided"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aesthetic</label>
              {isEditing ? (
                <select
                  value={formData.aesthetic}
                  onChange={(e) => setFormData({ ...formData, aesthetic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Select Aesthetic</option>
                  {aesthetics.map((aesthetic) => (
                    <option key={aesthetic} value={aesthetic.toLowerCase()}>
                      {aesthetic}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-900 capitalize">{formData.aesthetic || "Not provided"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Colors (Select up to 5)</label>
              {isEditing ? (
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <label key={color} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.favoriteColors.includes(color.toLowerCase())}
                        onChange={(e) => {
                          if (e.target.checked && formData.favoriteColors.length < 5) {
                            setFormData({
                              ...formData,
                              favoriteColors: [...formData.favoriteColors, color.toLowerCase()],
                            })
                          } else if (!e.target.checked) {
                            setFormData({
                              ...formData,
                              favoriteColors: formData.favoriteColors.filter((c) => c !== color.toLowerCase()),
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                      />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteColors.length > 0 ? (
                    formData.favoriteColors.map((color) => (
                      <span key={color} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm capitalize">
                        {color}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
