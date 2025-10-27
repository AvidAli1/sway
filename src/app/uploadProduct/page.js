"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Upload, ImageIcon, DollarSign, Package, Tag, Palette, Ruler, AlertCircle, Save, Eye } from "lucide-react"

export default function BrandProductUpload() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        stock: "",
        category: "",
        subCategory: "",
        sizes: [],
        colors: [],
        images: [],
        discount: "",
        tags: [],
        features: [],
        specifications: [],
        gender: "unisex",
        material: "",
        fitType: "",
        occasion: "",
        careInstructions: "",
        status: 'active',
        sizeChart: null,
        thumbnail: null,     // will hold the first uploaded image by default
        isFeatured: false,   // admin-controlled, always false for brand uploads
        inStock: true,       // true by default per your requirement
    })

    const [dragActive, setDragActive] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [successMsg, setSuccessMsg] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)
    const router = useRouter()
    // Local controlled text inputs for tags/features so user can type commas naturally.
    const [tagsInput, setTagsInput] = useState((formData.tags || []).join(', '))
    const [featuresInput, setFeaturesInput] = useState((formData.features || []).join(', '))

    // Keep the text inputs in sync if formData arrays change externally.
    useEffect(() => {
        setTagsInput((formData.tags || []).join(', '))
    }, [formData.tags])
    useEffect(() => {
        setFeaturesInput((formData.features || []).join(', '))
    }, [formData.features])

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

    // (Specifications UI removed — specifications remain in state and will be sent as empty array if unused)

    const handleImageUpload = (files) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        const fileArray = Array.from(files)

        // Improved HEIC/HEIF detection: check filename and mime hints
        const isHeic = (f) => {
            const fileName = (f.name || '').toLowerCase()
            const mimeType = (f.type || '').toLowerCase()
            return /\.(heic|heif)$/i.test(fileName) || mimeType.includes('heic') || mimeType.includes('heif')
        }

        const rejected = fileArray.filter(f => !allowed.includes(f.type) || isHeic(f))
        const accepted = fileArray.filter(f => allowed.includes(f.type) && !isHeic(f))

        if (rejected.length > 0) {
            const names = rejected.map(f => f.name || 'unknown').join(', ')
            setErrorMsg(`Skipped unsupported files: ${names}. Please upload JPG/PNG/WebP/GIF.`)
            // clear the error after a short time
            setTimeout(() => setErrorMsg(null), 6000)
        }

        const newImages = accepted.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
        }))

        setFormData((prev) => {
            const combined = [...prev.images, ...newImages].slice(0, 5)
            // If thumbnail not set, set it to the first image uploaded (either existing first or new first)
            const thumbnail = prev.thumbnail || combined[0] || null
            return {
                ...prev,
                images: combined,
                thumbnail,
            }
        })
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            // Build FormData (multipart/form-data)
            const fd = new FormData()
            fd.append('name', formData.title || '')
            fd.append('description', formData.description || '')
            fd.append('category', formData.category || '')
            fd.append('price', String(Number(formData.price) || 0))
            // Treat the user-entered "price" as the originalPrice.
            // Backend expects originalPrice (list price) and price (final price after discount).
            const entered = Number(formData.price) || 0
            const discountPct = Number(formData.discount) || 0
            const calculatedPrice = Math.round(entered * (1 - discountPct / 100))
            fd.append('originalPrice', String(entered))
            fd.append('price', String(calculatedPrice))
            fd.append('currency', 'PKR')
            fd.append('discount', String(Number(formData.discount) || 0))
            fd.append('stock', String(Number(formData.stock) || 0))
            fd.append('inStock', String(Boolean(formData.inStock)))
            // brands cannot mark featured — always send false by default
            fd.append('isFeatured', String(Boolean(formData.isFeatured))) 
            fd.append('subCategory', formData.subCategory || '')
            fd.append('gender', formData.gender || 'unisex')
            fd.append('material', formData.material || '')
            fd.append('fitType', formData.fitType || '')
            fd.append('occasion', formData.occasion || '')
            fd.append('careInstructions', formData.careInstructions || '')
            // arrays: send as JSON strings (backend can JSON.parse)
            fd.append('sizes', JSON.stringify(formData.sizes || []))
            fd.append('colors', JSON.stringify(formData.colors || []))
            fd.append('status', formData.status || 'active')

            // Attach images (files). backend expects uploaded files in form-data
            // formData.images contains objects { file, url, id } for local uploads
            formData.images.forEach((img, idx) => {
                if (img?.file) {
                    // use field name 'images' multiple times
                    fd.append('images', img.file, img.file.name || `image-${idx}.jpg`)
                }
            })

            // Ensure thumbnail is appended (backend expects thumbnail). Prefer explicit thumbnail, else first image.
            if (formData.thumbnail && formData.thumbnail.file) {
                fd.append('thumbnail', formData.thumbnail.file, formData.thumbnail.file.name || 'thumbnail.jpg')
            } else if (formData.images[0] && formData.images[0].file) {
                fd.append('thumbnail', formData.images[0].file, formData.images[0].file.name || 'thumbnail.jpg')
            }

            // optional sizeChart file
            if (formData.sizeChart) {
                fd.append('sizeChart', formData.sizeChart, formData.sizeChart.name || 'size-chart.jpg')
            }

            // Specifications, tags and features as JSON strings
            fd.append('specifications', JSON.stringify(formData.specifications || []))
            fd.append('tags', JSON.stringify(formData.tags || []))
            fd.append('features', JSON.stringify(formData.features || []))

            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

            const res = await fetch('/api/brand/products', {
                method: 'POST',
                // DO NOT set Content-Type header for multipart/form-data here
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: fd,
            })

            // attempt to parse json safely
            let data = null
            try {
                const ct = res.headers.get('content-type') || ''
                data = ct.includes('application/json') ? await res.json() : { message: await res.text() }
            } catch (parseErr) {
                data = null
            }

            if (!res.ok) {
                const msg = data?.error || data?.message || `Server returned ${res.status}`
                setErrorMsg(msg)
                return
            }

            setSuccessMsg(data?.message || 'Product uploaded successfully')
            setTimeout(() => router.push('/brandDashboard'), 1200)
        } catch (err) {
            console.error('Error uploading product:', err)
            setErrorMsg(err.message || 'Failed to upload product')
        } finally {
            setSubmitting(false)
        }
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
                                disabled={submitting}
                                className={`bg-yellow-400 text-black px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-500'}`}
                            >
                                <Save className="w-4 h-4" />
                                {submitting ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </div>
                </div>

                
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {successMsg && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
                        {errorMsg}
                    </div>
                )}

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
                                {/* originalPrice removed from UI: entered Price is treated as originalPrice on submit */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                                    <input
                                        type="text"
                                        value={formData.subCategory}
                                        onChange={(e) => handleInputChange("subCategory", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. casual, formal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metadata (moved below Size Chart) */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Metadata</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleInputChange("gender", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    >
                                        <option value="unisex">Unisex</option>
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option value="kids">Kids</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                                    <input
                                        type="text"
                                        value={formData.material}
                                        onChange={(e) => handleInputChange("material", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. 100% Cotton"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit Type</label>
                                    <input
                                        type="text"
                                        value={formData.fitType}
                                        onChange={(e) => handleInputChange("fitType", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. Regular Fit"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                                    <input
                                        type="text"
                                        value={formData.occasion}
                                        onChange={(e) => handleInputChange("occasion", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. Casual"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                                    <textarea
                                        value={formData.careInstructions}
                                        onChange={(e) => handleInputChange("careInstructions", e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. Machine wash cold, tumble dry low"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        onBlur={() => handleInputChange("tags", tagsInput.split(',').map(s => s.trim()).filter(Boolean))}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. cotton, premium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={featuresInput}
                                        onChange={(e) => setFeaturesInput(e.target.value)}
                                        onBlur={() => handleInputChange("features", featuresInput.split(',').map(s => s.trim()).filter(Boolean))}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        placeholder="e.g. Breathable, Durable"
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
                                            <img
                                                src={image.url || "/placeholder.svg"}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => {
                                                        const images = prev.images.filter((img) => img.id !== image.id)
                                                        // if the removed image was the thumbnail, pick the next image as thumbnail
                                                        const thumbnail = prev.thumbnail && prev.thumbnail.id === image.id ? (images[0] || null) : prev.thumbnail
                                                        return {
                                                            ...prev,
                                                            images,
                                                            thumbnail,
                                                        }
                                                    })
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
                            <img
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
                                    <img
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
