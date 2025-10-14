# Customer Product API Documentation

This document describes the Customer Product API endpoints for browsing and discovering products in the Sway application.

## Base URL
All endpoints are prefixed with `/api/customer/products`

## Authentication
Customer endpoints do **NOT** require authentication - they are public endpoints for browsing products.

---

## 🛍️ **Customer Product Endpoints**

### 1. **Infinite Scroll Product Listing**
**GET** `/api/customer/products`

The main endpoint for infinite scrolling product discovery with comprehensive filtering and sorting.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `subCategory` (optional): Filter by subcategory
- `gender` (optional): Filter by gender (men/women/unisex/kids/all)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `brand` (optional): Filter by brand ID
- `search` (optional): Search term
- `sortBy` (optional): Sort field (createdAt/price/name/popularity/rating)
- `sortOrder` (optional): Sort order (asc/desc)
- `featured` (optional): Show only featured products (true/false)

#### Example URLs
```bash
# Basic infinite scroll
GET http://localhost:3000/api/customer/products?page=1&limit=12

# With filters
GET http://localhost:3000/api/customer/products?category=clothing&gender=unisex&minPrice=1000&maxPrice=5000

# With search and sorting
GET http://localhost:3000/api/customer/products?search=cotton&sortBy=price&sortOrder=asc

# Featured products only
GET http://localhost:3000/api/customer/products?featured=true&limit=8
```

#### Response
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Premium Cotton T-Shirt",
      "description": "High-quality cotton t-shirt",
      "price": 2500,
      "originalPrice": 3000,
      "discount": 16.67,
      "thumbnail": {
        "HD": "https://...",
        "SD": "https://..."
      },
      "images": [...],
      "brand": {
        "_id": "...",
        "name": "Test Brand",
        "businessEmail": "brand@example.com",
        "logo": "https://..."
      },
      "ratings": 4.5,
      "numReviews": 25,
      "slug": "premium-cotton-t-shirt"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalProducts": 120,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 12
  },
  "filters": {
    "categories": ["clothing", "accessories", "shoes"],
    "subCategories": ["t-shirts", "jeans", "dresses"],
    "brands": ["brand1", "brand2", "brand3"],
    "priceRange": {
      "min": 500,
      "max": 10000,
      "average": 2500
    }
  }
}
```

---

### 2. **Single Product View**
**GET** `/api/customer/products/[id]`

Get detailed information about a specific product with related and similar products.

#### Example
```bash
GET http://localhost:3000/api/customer/products/507f1f77bcf86cd799439011
```

#### Response
```json
{
  "success": true,
  "product": {
    "_id": "...",
    "name": "Premium Cotton T-Shirt",
    "description": "High-quality cotton t-shirt",
    "price": 2500,
    "originalPrice": 3000,
    "discount": 16.67,
    "images": [...],
    "brand": {
      "_id": "...",
      "name": "Test Brand",
      "businessEmail": "brand@example.com",
      "logo": "https://...",
      "description": "Brand description",
      "address": {...}
    },
    "specifications": [...],
    "features": [...],
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["White", "Black", "Navy"],
    "ratings": 4.5,
    "numReviews": 25
  },
  "relatedProducts": [...],
  "similarProducts": [...]
}
```

---

### 3. **Product Search**
**GET** `/api/customer/products/search`

Search products with advanced search capabilities and suggestions.

#### Query Parameters
- `q` (required): Search query (minimum 2 characters)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `sortBy` (optional): Sort field (relevance/price/name/rating/popularity/newest)
- `sortOrder` (optional): Sort order (asc/desc)

#### Example
```bash
GET http://localhost:3000/api/customer/products/search?q=cotton%20t-shirt&page=1&limit=12
```

#### Response
```json
{
  "success": true,
  "query": "cotton t-shirt",
  "products": [...],
  "pagination": {...},
  "suggestions": ["clothing", "t-shirts", "cotton"],
  "relatedSearches": ["cotton", "t-shirt", "casual"]
}
```

---

### 4. **Featured Products**
**GET** `/api/customer/products/featured`

Get featured products for homepage or promotional sections.

#### Query Parameters
- `limit` (optional): Number of products (default: 12)

#### Example
```bash
GET http://localhost:3000/api/customer/products/featured?limit=8
```

#### Response
```json
{
  "success": true,
  "products": [...],
  "count": 8
}
```

---

### 5. **Product Categories**
**GET** `/api/customer/products/categories`

Get all available categories with product counts and subcategories.

#### Example
```bash
GET http://localhost:3000/api/customer/products/categories
```

#### Response
```json
{
  "success": true,
  "categories": [
    {
      "name": "clothing",
      "count": 150,
      "subCategories": [
        { "name": "t-shirts", "count": 50 },
        { "name": "jeans", "count": 30 },
        { "name": "dresses", "count": 40 }
      ],
      "priceRange": {
        "min": 500,
        "max": 5000,
        "average": 2500
      }
    }
  ]
}
```

---

### 6. **Product Recommendations**
**GET** `/api/customer/products/recommendations`

Get personalized product recommendations based on various criteria.

#### Query Parameters
- `limit` (optional): Number of recommendations (default: 12)
- `category` (optional): Get recommendations for specific category
- `productId` (optional): Get recommendations based on specific product
- `userId` (optional): For future user-based recommendations

#### Examples
```bash
# General recommendations
GET http://localhost:3000/api/customer/products/recommendations?limit=8

# Category-based recommendations
GET http://localhost:3000/api/customer/products/recommendations?category=clothing&limit=6

# Product-based recommendations
GET http://localhost:3000/api/customer/products/recommendations?productId=507f1f77bcf86cd799439011&limit=8
```

#### Response
```json
{
  "success": true,
  "recommendations": [...],
  "count": 8,
  "type": "product-based"
}
```

---

## 🎯 **Frontend Implementation Examples**

### **Infinite Scroll Implementation**
```javascript
// React example for infinite scroll
const [products, setProducts] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMoreProducts = async () => {
  if (loading) return;
  
  setLoading(true);
  try {
    const response = await fetch(
      `http://localhost:3000/api/customer/products?page=${page}&limit=12`
    );
    const data = await response.json();
    
    if (data.success) {
      setProducts(prev => [...prev, ...data.products]);
      setHasMore(data.pagination.hasNextPage);
      setPage(prev => prev + 1);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    setLoading(false);
  }
};

// Load more when user scrolls to bottom
useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 1000) {
      loadMoreProducts();
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [page, loading]);
```

### **Search Implementation**
```javascript
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

const handleSearch = async (query) => {
  if (query.length < 2) return;
  
  try {
    const response = await fetch(
      `http://localhost:3000/api/customer/products/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    if (data.success) {
      setSearchResults(data.products);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
};
```

### **Filter Implementation**
```javascript
const [filters, setFilters] = useState({
  category: '',
  minPrice: '',
  maxPrice: '',
  gender: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

const applyFilters = async () => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.append(key, value);
    }
  });
  
  try {
    const response = await fetch(
      `http://localhost:3000/api/customer/products?${params.toString()}`
    );
    const data = await response.json();
    
    if (data.success) {
      setProducts(data.products);
    }
  } catch (error) {
    console.error('Filter error:', error);
  }
};
```

---

## 📱 **Mobile Optimization**

All endpoints are optimized for mobile with:
- **Responsive image URLs**: HD/SD versions for different screen sizes
- **Efficient pagination**: Small page sizes for mobile data usage
- **Fast loading**: Lean queries with minimal data transfer
- **Search suggestions**: Real-time search suggestions for mobile UX

---

## 🔍 **Search Features**

- **Multi-field search**: Searches name, description, tags, category, material, features
- **Fuzzy matching**: Case-insensitive partial matches
- **Search suggestions**: Related categories and terms
- **Relevance sorting**: Prioritizes exact matches and popular products
- **Related searches**: Suggests similar search terms

---

## 🎨 **UI Integration Tips**

1. **Infinite Scroll**: Use the main products endpoint with pagination
2. **Search Bar**: Implement debounced search with suggestions
3. **Filters**: Use the filters object from the main endpoint for filter options
4. **Product Cards**: Use thumbnail.SD for mobile, thumbnail.HD for desktop
5. **Related Products**: Use the single product endpoint's related/similar products
6. **Homepage**: Use featured products endpoint for hero sections

This API provides everything needed for a modern e-commerce product browsing experience! 🚀
