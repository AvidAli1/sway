# Brand Product API Documentation

This document describes the Brand Product CRUD API endpoints for managing products in the Sway application.

## Base URL
All endpoints are prefixed with `/api/brand/products`

## Authentication
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Products
**GET** `/api/brand/products`

Retrieves all products for the authenticated brand with pagination and filtering options.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`active`, `inactive`, `draft`, `all`)
- `category` (optional): Filter by category
- `search` (optional): Search in name, description, and tags

#### Response
```json
{
  "success": true,
  "products": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Create Product
**POST** `/api/brand/products`

Creates a new product for the authenticated brand.

#### Request Body (FormData)
- `name` (required): Product name
- `description`: Product description
- `category` (required): Product category
- `subCategory`: Product subcategory
- `originalPrice`: Original price (number)
- `price` (required): Current price (number)
- `currency`: Currency code (default: PKR)
- `discount`: Discount percentage (number)
- `stock`: Stock quantity (number)
- `inStock`: Boolean (true/false)
- `gender`: Gender target (men/women/unisex/kids)
- `material`: Product material
- `fitType`: Fit type
- `occasion`: Occasion
- `careInstructions`: Care instructions
- `isFeatured`: Boolean (true/false)
- `status`: Product status (active/inactive/draft)
- `sizes`: JSON array of sizes
- `colors`: JSON array of colors
- `tags`: JSON array of tags
- `features`: JSON array of features
- `specifications`: JSON array of specifications
- `thumbnail`: Image file (will be converted to HD JPEG and SD WebP)
- `images`: Multiple image files (will be converted to HD JPEG and SD WebP)

#### Response
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "...",
    "name": "Product Name",
    "slug": "product-name",
    "sku": "BRA-1234567890",
    "thumbnail": {
      "HD": "https://...",
      "SD": "https://..."
    },
    "images": [
      {
        "HD": "https://...",
        "SD": "https://..."
      }
    ],
    ...
  }
}
```

### 3. Get Single Product
**GET** `/api/brand/products/[id]`

Retrieves a specific product by ID.

#### Response
```json
{
  "success": true,
  "product": {
    "_id": "...",
    "name": "Product Name",
    ...
  }
}
```

### 4. Update Product
**PUT** `/api/brand/products/[id]`

Updates an existing product. Uses FormData like the create endpoint.

#### Request Body (FormData)
Same fields as create endpoint. Only include fields you want to update.

#### Response
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "...",
    "name": "Updated Product Name",
    ...
  }
}
```

### 5. Delete Product
**DELETE** `/api/brand/products/[id]`

Deletes a product.

#### Response
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 6. Get Product Statistics
**GET** `/api/brand/products/stats`

Retrieves product statistics for the authenticated brand.

#### Response
```json
{
  "success": true,
  "stats": {
    "totalProducts": 50,
    "activeProducts": 45,
    "inactiveProducts": 3,
    "draftProducts": 2,
    "featuredProducts": 10,
    "outOfStockProducts": 5,
    "categoryStats": [
      {
        "_id": "clothing",
        "count": 25,
        "totalValue": 50000
      }
    ],
    "recentProducts": [...]
  }
}
```

## Image Processing

All images uploaded through these endpoints are automatically processed:

1. **HD Images**: Resized to max 1200x1200px and converted to JPEG format (90% quality)
2. **SD Images**: Resized to max 600x600px and converted to WebP format (80% quality)

Images are stored in AWS S3 with the following structure:
- HD images: `products/hd/{timestamp}_{filename}_hd.jpg`
- SD images: `products/sd/{timestamp}_{filename}_sd.webp`

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- `400`: Bad Request (missing required fields)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (user doesn't have brand role)
- `404`: Not Found (product or brand not found)
- `409`: Conflict (duplicate slug or SKU)
- `500`: Internal Server Error

## Example Usage

### Creating a Product with Images
```javascript
const formData = new FormData();
formData.append('name', 'Premium T-Shirt');
formData.append('description', 'High-quality cotton t-shirt');
formData.append('category', 'clothing');
formData.append('price', '2500');
formData.append('currency', 'PKR');
formData.append('sizes', JSON.stringify(['S', 'M', 'L', 'XL']));
formData.append('colors', JSON.stringify(['Red', 'Blue', 'Black']));
formData.append('thumbnail', thumbnailFile);
formData.append('images', imageFile1);
formData.append('images', imageFile2);

const response = await fetch('/api/brand/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Updating Product Stock
```javascript
const formData = new FormData();
formData.append('stock', '100');
formData.append('inStock', 'true');

const response = await fetch(`/api/brand/products/${productId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```
