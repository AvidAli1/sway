"use client"

import { useState } from "react"
import { Upload, ImageIcon, DollarSign, Package, Tag, Palette, Ruler, AlertCircle, Save, Eye } from "lucide-react"
import Image from 'next/image';

export default function BrandProductUpload() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        sizes: [],
        colors: [],
        images: [],
        discount: "",
        sizeChart: null,
    })

    const [dragActive, setDragActive] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)

    const categories = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"]
    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"]
    const availableColors = [
        { name: "Black", value: "black" },
        { name: "White", value: "white" },
        { name: "Grey", value: "grey" },
        { name: "Navy", value: "navy" },
        { name: "Red", value: "red" },
        { name: "Blue", value: "blue" },
        { name: "Green", value: "green" },
        { name: "Yellow", value: "yellow" },
    ]

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleArrayToggle = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
        }))
    }

    const handleImageUpload = (files) => {
        const newImages = Array.from(files).map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
        }))

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages].slice(0, 5), // Max 5 images
        }))
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission
        console.log("Product data:", formData)
        alert("Product uploaded successfully!")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Upload New Product</h1>
                            <p className="text-gray-600">Add a new product to your inventory</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                {previewMode ? "Edit Mode" : "Preview"}
                            </button>
                            <button
                                form="product-form"
                                type="submit"
                                className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {previewMode ? (
                    <ProductPreview formData={formData} />
                ) : (
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Basic Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="Enter product title"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="Describe your product..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => handleInputChange("category", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (PKR) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={(e) => handleInputChange("price", e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => handleInputChange("stock", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={(e) => handleInputChange("discount", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Product Images *
                            </h2>

                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-yellow-400 bg-yellow-50" : "border-gray-300 hover:border-gray-400"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">Drop images here or click to upload</p>
                                <p className="text-gray-600 mb-4">Upload up to 5 images (JPG, PNG, WebP)</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e.target.files)}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors cursor-pointer inline-block"
                                >
                                    Choose Files
                                </label>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                                    {formData.images.map((image, index) => (
                                        <div key={image.id} className="relative group">
                                            <Image
                                                src={image.url || "/placeholder.svg"}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        images: prev.images.filter((img) => img.id !== image.id),
                                                    }))
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Product Variants
                            </h2>

                            <div className="space-y-6">
                                {/* Sizes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Ruler className="w-4 h-4" />
                                        Available Sizes
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                        {availableSizes.map((size) => (
                                            <label
                                                key={size}
                                                className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.sizes.includes(size)
                                                        ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.sizes.includes(size)}
                                                    onChange={() => handleArrayToggle("sizes", size)}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Available Colors
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {availableColors.map((color) => (
                                            <label
                                                key={color.value}
                                                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.colors.includes(color.value)
                                                        ? "border-yellow-400 bg-yellow-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.colors.includes(color.value)}
                                                    onChange={() => handleArrayToggle("colors", color.value)}
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 border-gray-300 ${color.value === "black"
                                                            ? "bg-black"
                                                            : color.value === "white"
                                                                ? "bg-white"
                                                                : color.value === "grey"
                                                                    ? "bg-gray-500"
                                                                    : color.value === "navy"
                                                                        ? "bg-blue-900"
                                                                        : color.value === "red"
                                                                            ? "bg-red-500"
                                                                            : color.value === "blue"
                                                                                ? "bg-blue-500"
                                                                                : color.value === "green"
                                                                                    ? "bg-green-500"
                                                                                    : "bg-yellow-500"
                                                        }`}
                                                />
                                                <span>{color.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Size Chart Upload */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Size Chart (Optional)</h2>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleInputChange("sizeChart", e.target.files[0])}
                                    className="hidden"
                                    id="size-chart-upload"
                                />
                                <label htmlFor="size-chart-upload" className="cursor-pointer">
                                    <Ruler className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600">Upload size chart image</p>
                                </label>
                            </div>
                        </div>

                        {/* Validation Alerts */}
                        {(!formData.title ||
                            !formData.price ||
                            !formData.stock ||
                            !formData.category ||
                            formData.images.length === 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-medium text-yellow-800">Required fields missing</h3>
                                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                                {!formData.title && <li>• Product title is required</li>}
                                                {!formData.price && <li>• Price is required</li>}
                                                {!formData.stock && <li>• Stock quantity is required</li>}
                                                {!formData.category && <li>• Category is required</li>}
                                                {formData.images.length === 0 && <li>• At least one product image is required</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </form>
                )}
            </div>
        </div>
    )
}

function ProductPreview({ formData }) {
    const discountedPrice = formData.discount ? formData.price * (1 - formData.discount / 100) : formData.price

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Images */}
                <div>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        {formData.images.length > 0 ? (
                            <Image
                                src={formData.images[0].url || "/placeholder.svg"}
                                alt={formData.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-16 h-16" />
                            </div>
                        )}
                    </div>

                    {formData.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {formData.images.slice(1).map((image, index) => (
                                <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                    <Image
                                        src={image.url || "/placeholder.svg"}
                                        alt={`${formData.title} ${index + 2}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{formData.title || "Product Title"}</h1>
                        <p className="text-gray-600 mt-2">{formData.description || "Product description will appear here..."}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-yellow-600">
                            PKR {discountedPrice ? Math.round(discountedPrice).toLocaleString() : "0"}
                        </span>
                        {formData.discount && (
                            <>
                                <span className="text-lg text-gray-500 line-through">
                                    PKR {formData.price ? Number.parseInt(formData.price).toLocaleString() : "0"}
                                </span>
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                                    {formData.discount}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {formData.sizes.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Available Sizes</h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.sizes.map((size) => (
                                    <span key={size} className="px-3 py-1 border border-gray-300 rounded text-sm">
                                        {size}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.colors.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Available Colors</h3>
                            <div className="flex gap-2">
                                {formData.colors.map((color) => (
                                    <div
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 border-gray-300 ${color === "black"
                                                ? "bg-black"
                                                : color === "white"
                                                    ? "bg-white"
                                                    : color === "grey"
                                                        ? "bg-gray-500"
                                                        : color === "navy"
                                                            ? "bg-blue-900"
                                                            : color === "red"
                                                                ? "bg-red-500"
                                                                : color === "blue"
                                                                    ? "bg-blue-500"
                                                                    : color === "green"
                                                                        ? "bg-green-500"
                                                                        : "bg-yellow-500"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Stock: {formData.stock || "0"} items</span>
                        <span>Category: {formData.category || "Not selected"}</span>
                    </div>

                    <button className="w-full bg-yellow-400 text-black py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
