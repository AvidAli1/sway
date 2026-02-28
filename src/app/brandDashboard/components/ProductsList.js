"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Eye, Plus, Search, Package, X, Upload, Save, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function ProductsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Products loaded from backend for this brand
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState(null)
  const [productDetails, setProductDetails] = useState(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchProducts = async () => {
      setProductsLoading(true)
      setProductsError(null)
      try {
        // include auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        const res = await fetch('/api/brand/products', {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include',
        })

        if (!res.ok) throw new Error(`Failed to load products: ${res.status}`)

        const data = await res.json()
        if (!mounted) return

        if (data && Array.isArray(data.products)) {
          const normalized = data.products.map((p) => ({
            id: p._id,
            title: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            image: (p.thumbnail && p.thumbnail.SD) || (p.images && p.images[0] && p.images[0].SD) || '/placeholder.svg',
            category: p.category || '',
            stock: p.stock != null ? p.stock : (p.inStock ? 1 : 0),
            status: p.status || (p.inStock ? 'active' : 'out_of_stock'),
            sales: p.salesCount || 0,
            rating: p.ratings || 0,
            reviews: p.numReviews || 0,
            raw: p,
          }))
          setProducts(normalized)
        } else {
          setProducts([])
        }
      } catch (err) {
        console.error(err)
        if (mounted) setProductsError(err.message)
      } finally {
        if (mounted) setProductsLoading(false)
      }
    }

    fetchProducts()
    return () => { mounted = false }
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || product.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status, stock) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
      case "out_of_stock":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
      case "low_stock":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>
    }
  }

  // Fetch full product details
  const fetchProductDetails = async (productId) => {
    setIsLoadingProduct(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const res = await fetch(`/api/brand/products/${productId}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })

      if (!res.ok) throw new Error(`Failed to load product: ${res.status}`)

      const data = await res.json()
      if (data.success && data.product) {
        setProductDetails(data.product)
      } else {
        throw new Error('Invalid product data')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingProduct(false)
    }
  }

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditingProduct(product)
    setProductDetails(null)
    fetchProductDetails(product.id)
  }

  // Close modal
  const handleCloseModal = () => {
    setEditingProduct(null)
    setProductDetails(null)
  }

  // Refresh products list
  const refreshProducts = async () => {
    setProductsLoading(true)
    setProductsError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const res = await fetch('/api/brand/products', {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })

      if (!res.ok) throw new Error(`Failed to load products: ${res.status}`)

      const data = await res.json()
      if (data && Array.isArray(data.products)) {
        const normalized = data.products.map((p) => ({
          id: p._id,
          title: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          image: (p.thumbnail && p.thumbnail.SD) || (p.images && p.images[0] && p.images[0].SD) || '/placeholder.svg',
          category: p.category || '',
          stock: p.stock != null ? p.stock : (p.inStock ? 1 : 0),
          status: p.status || (p.inStock ? 'active' : 'out_of_stock'),
          sales: p.salesCount || 0,
          rating: p.ratings || 0,
          reviews: p.numReviews || 0,
          raw: p,
        }))
        setProducts(normalized)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error(err)
      setProductsError(err.message)
    } finally {
      setProductsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const res = await fetch(`/api/brand/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Failed to delete product')

      setProducts(products.filter(p => p.id !== productToDelete.id))
      setProductToDelete(null)
    } catch (error) {
      console.error(error)
      alert("Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (editingProduct) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [editingProduct])

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Link
            href="/uploadProduct"
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium w-fit"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading products: {productsError}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">{getStatusBadge(product.status, product.stock)}</div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <span>Sales: {product.sales}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Rating: {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/productDetails/${product.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first product"}
            </p>
            <Link
              href="/uploadProduct"
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to delete <span className="font-semibold text-gray-700">"{productToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center disabled:opacity-50 gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          productDetails={productDetails}
          isLoading={isLoadingProduct}
          onClose={handleCloseModal}
          onRefresh={refreshProducts}
        />
      )}
    </div>
  )
}

// Edit Product Modal Component
function EditProductModal({ product, productDetails, isLoading, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    originalPrice: '',
    discount: '',
    currency: '',
    stock: '',
    inStock: true,
    gender: 'unisex',
    material: '',
    fitType: '',
    occasion: '',
    careInstructions: '',
    isFeatured: false,
    status: 'active',
    sizes: [],
    colors: [],
    tags: [],
    features: [],

    specifications: [],
    season: '', // Added Season
    sku: '',    // Added SKU
  })

  const [images, setImages] = useState([])
  const [selectedImages, setSelectedImages] = useState(new Set())
  const [isDeletingImages, setIsDeletingImages] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [isReordering, setIsReordering] = useState(false)

  // Initialize form data when productDetails loads
  useEffect(() => {
    if (productDetails) {
      setFormData({
        name: productDetails.name || '',
        description: productDetails.description || '',
        category: productDetails.category || '',
        subCategory: productDetails.subCategory || '',
        originalPrice: productDetails.originalPrice?.toString() || '',
        discount: productDetails.discount?.toString() || '',
        currency: productDetails.currency || 'PKR',
        stock: productDetails.stock?.toString() || '',
        inStock: productDetails.inStock !== undefined ? productDetails.inStock : true,
        gender: productDetails.gender || 'unisex',
        material: productDetails.material || '',
        fitType: productDetails.fitType || '',
        occasion: productDetails.occasion || '',
        careInstructions: productDetails.careInstructions || '',
        isFeatured: productDetails.isFeatured || false,
        status: productDetails.status || 'active',
        sizes: productDetails.sizes || [],
        colors: productDetails.colors || [],
        tags: productDetails.tags || [],
        features: productDetails.features || [],

        specifications: productDetails.specifications || [],
        season: productDetails.season || '',
        sku: productDetails.sku || '',
      })
      setImages(productDetails.images || [])
    }
  }, [productDetails])

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle array field changes (comma-separated)
  const handleArrayChange = (field, value) => {
    const array = value ? value.split(',').map(item => item.trim()).filter(item => item) : []
    setFormData(prev => ({ ...prev, [field]: array }))
  }

  // Handle specifications changes
  const handleSpecificationChange = (index, key, value) => {
    const newSpecs = [...formData.specifications]
    if (index >= 0 && index < newSpecs.length) {
      newSpecs[index] = { ...newSpecs[index], [key]: value }
    } else {
      newSpecs.push({ key: '', value: '' })
    }
    setFormData(prev => ({ ...prev, specifications: newSpecs }))
  }

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }))
  }

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  // Delete image
  const handleDeleteImage = async (index) => {
    if (!productDetails) return

    setIsDeletingImages(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const res = await fetch(`/api/brand/products/${product.id}/images?indices=${index}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to delete image')

      // Refresh product details
      const productRes = await fetch(`/api/brand/products/${product.id}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })
      const data = await productRes.json()
      if (data.success && data.product) {
        setImages(data.product.images || [])
        setSelectedImages(new Set())
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete image: ' + err.message)
    } finally {
      setIsDeletingImages(false)
    }
  }

  // Delete all selected images
  const handleDeleteAllImages = async () => {
    if (!productDetails || images.length === 0) return

    setIsDeletingImages(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const indices = Array.from({ length: images.length }, (_, i) => i).join(',')
      const res = await fetch(`/api/brand/products/${product.id}/images?indices=${indices}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed to delete images')

      // Refresh product details
      const productRes = await fetch(`/api/brand/products/${product.id}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })
      const data = await productRes.json()
      if (data.success && data.product) {
        setImages(data.product.images || [])
        setSelectedImages(new Set())
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete images: ' + err.message)
    } finally {
      setIsDeletingImages(false)
    }
  }

  // Upload images
  const handleImageUpload = async (files, index = null) => {
    if (!productDetails || !files || files.length === 0) return

    setIsUploadingImages(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const formData = new FormData()

      Array.from(files).forEach(file => {
        formData.append('images', file)
      })

      if (index !== null) {
        formData.append('index', index.toString())
      }

      const res = await fetch(`/api/brand/products/${product.id}/images`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to upload images')

      // Refresh product details
      const productRes = await fetch(`/api/brand/products/${product.id}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })
      const data = await productRes.json()
      if (data.success && data.product) {
        setImages(data.product.images || [])
      }
    } catch (err) {
      console.error(err)
      alert('Failed to upload images: ' + err.message)
    } finally {
      setIsUploadingImages(false)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only clear if we're leaving the drag area entirely
    const relatedTarget = e.relatedTarget
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverIndex(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    setIsReordering(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

      // Use the new PUT endpoint to reorder images server-side
      const reorderRes = await fetch(
        `/api/brand/products/${product.id}/images?fromIndex=${draggedIndex}&toIndex=${dropIndex}`,
        {
          method: 'PUT',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include',
        }
      )

      if (!reorderRes.ok) {
        const errorData = await reorderRes.json().catch(() => ({ error: 'Failed to reorder image' }))
        throw new Error(errorData.error || 'Failed to reorder image')
      }

      // Refresh product details to get updated image order
      const productRes = await fetch(`/api/brand/products/${product.id}`, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      })
      const data = await productRes.json()
      if (data.success && data.product) {
        setImages(data.product.images || [])
      }
    } catch (err) {
      console.error('Reorder error:', err)
      alert('Failed to reorder image: ' + err.message)
    } finally {
      setIsReordering(false)
      setDraggedIndex(null)
      setDragOverIndex(null)
    }
  }

  // Save product
  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      const formDataObj = new FormData()

      // Add all fields
      formDataObj.append('name', formData.name || '')
      formDataObj.append('description', formData.description || '')
      formDataObj.append('category', formData.category || '')
      if (formData.subCategory) formDataObj.append('subCategory', formData.subCategory)
      formDataObj.append('originalPrice', formData.originalPrice || '0')
      formDataObj.append('discount', formData.discount || '0')
      formDataObj.append('currency', formData.currency || 'PKR')
      formDataObj.append('stock', formData.stock || '0')
      formDataObj.append('inStock', formData.inStock ? 'true' : 'false')
      formDataObj.append('gender', formData.gender || 'unisex')
      formDataObj.append('material', formData.material || '')
      formDataObj.append('fitType', formData.fitType || '')
      formDataObj.append('occasion', formData.occasion || '')
      formDataObj.append('careInstructions', formData.careInstructions || '')
      formDataObj.append('isFeatured', formData.isFeatured ? 'true' : 'false')
      formDataObj.append('status', formData.status || 'active')

      // Add arrays as JSON strings
      formDataObj.append('sizes', JSON.stringify(formData.sizes || []))
      formDataObj.append('colors', JSON.stringify(formData.colors || []))
      formDataObj.append('tags', JSON.stringify(formData.tags || []))
      formDataObj.append('features', JSON.stringify(formData.features || []))

      formDataObj.append('specifications', JSON.stringify(formData.specifications || []))
      formDataObj.append('season', formData.season || '')
      formDataObj.append('sku', formData.sku || '')

      const res = await fetch(`/api/brand/products/${product.id}`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
        body: formDataObj,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update product' }))
        throw new Error(errorData.error || 'Failed to update product')
      }

      setSaveSuccess(true)
      setTimeout(() => {
        onRefresh()
        onClose()
      }, 1000)
    } catch (err) {
      console.error(err)
      setSaveError(err.message || 'Failed to save product')
    } finally {
      setIsSaving(false)
    }
  }

  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : productDetails ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>

            {/* Error/Success Messages */}
            {saveError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                Product updated successfully!
              </div>
            )}

            {/* Image Gallery Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                <div className="flex gap-2">
                  {images.length > 0 && (
                    <button
                      onClick={handleDeleteAllImages}
                      disabled={isDeletingImages}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Delete All
                    </button>
                  )}
                  <label className="px-3 py-1 bg-yellow-400 text-black rounded text-sm hover:bg-yellow-500 transition-colors cursor-pointer flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={isUploadingImages}
                    />
                  </label>
                </div>
              </div>

              {/* Horizontal Scrollable Image Gallery */}
              {images.length > 0 ? (
                <div
                  className="flex gap-4 overflow-x-auto pb-4"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDragLeave={(e) => {
                    // Only clear if leaving the entire gallery area
                    const relatedTarget = e.relatedTarget
                    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                      setDragOverIndex(null)
                    }
                  }}
                >
                  {images.map((img, index) => {
                    // Calculate visual states
                    const isDragging = draggedIndex === index
                    const isDropTarget = draggedIndex !== null && dragOverIndex === index && draggedIndex !== index
                    // Show drop zone before this image if dragging and hovering over it
                    const showDropZoneBefore = isDropTarget

                    return (
                      <div key={index} className="flex items-center">
                        {/* Drop zone indicator - shows where image will be inserted */}
                        {showDropZoneBefore && (
                          <div className="flex-shrink-0 w-2 h-32 bg-yellow-400 rounded border-2 border-yellow-500 animate-pulse mr-2" />
                        )}

                        <div
                          draggable={!isReordering}
                          onDragStart={(e) => !isReordering && handleDragStart(e, index)}
                          onDragOver={(e) => !isReordering && handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => !isReordering && handleDrop(e, index)}
                          className={`relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border-2 transition-all duration-200 ${isDropTarget
                            ? 'border-yellow-400 border-dashed scale-105 shadow-lg'
                            : 'border-gray-200'
                            } ${isDragging
                              ? 'opacity-30 cursor-grabbing scale-95'
                              : 'cursor-grab hover:border-gray-300'
                            }`}
                        >
                          <img
                            src={img.SD || img.HD || '/placeholder.svg'}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                            draggable={false}
                          />
                          {!isDragging && (
                            <>
                              <button
                                onClick={() => handleDeleteImage(index)}
                                disabled={isDeletingImages || isReordering}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 z-10"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* Drop zone at the end - if dragging and not over any specific image */}
                  {draggedIndex !== null && dragOverIndex === null && (
                    <div className="flex items-center ml-2">
                      <div className="flex-shrink-0 w-2 h-32 bg-yellow-400 rounded border-2 border-yellow-500 animate-pulse" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">No images uploaded</p>
                  <label className="inline-block px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={isUploadingImages}
                    />
                  </label>
                </div>
              )}
              {isUploadingImages && (
                <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) => handleInputChange('subCategory', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                    <select
                      value={formData.season}
                      onChange={(e) => handleInputChange('season', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Select Season</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Autumn">Autumn</option>
                      <option value="Winter">Winter</option>
                      <option value="All Seasons">All Seasons</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price *</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => handleInputChange('inStock', e.target.checked)}
                      className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">In Stock</label>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="unisex">Unisex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => handleInputChange('material', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fit Type</label>
                    <input
                      type="text"
                      value={formData.fitType}
                      onChange={(e) => handleInputChange('fitType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                    <input
                      type="text"
                      value={formData.occasion}
                      onChange={(e) => handleInputChange('occasion', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                    <textarea
                      value={formData.careInstructions}
                      onChange={(e) => handleInputChange('careInstructions', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Arrays */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.sizes.join(', ')}
                      onChange={(e) => handleArrayChange('sizes', e.target.value)}
                      placeholder="XS, S, M, L, XL, XXL"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.colors.join(', ')}
                      onChange={(e) => handleArrayChange('colors', e.target.value)}
                      placeholder="White, Black, Navy Blue, Red"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleArrayChange('tags', e.target.value)}
                      placeholder="cotton, premium, casual"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                    <textarea
                      value={formData.features.join(', ')}
                      onChange={(e) => handleArrayChange('features', e.target.value)}
                      rows={3}
                      placeholder="Feature 1, Feature 2, Feature 3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="space-y-2">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                        placeholder="Key"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    + Add Specification
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Failed to load product details</p>
          </div>
        )}
      </div>
    </div>
  )
}
