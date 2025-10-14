# Brand Product API Testing Guide

## ⚠️ Important: Price Calculation
The API automatically calculates the final price based on:
- **originalPrice**: The original price of the product
- **discount**: Discount percentage (0-100)

**Formula**: `finalPrice = originalPrice - (originalPrice × discount ÷ 100)`

**Example**: 
- originalPrice: 3000 PKR
- discount: 16.67%
- finalPrice: 3000 - (3000 × 16.67 ÷ 100) = 2500 PKR

## Base URL
```
http://localhost:3000/api/brand/products
```

## Authentication
All requests require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. GET All Products (with pagination and filters)

### Basic Request
```bash
GET http://localhost:3000/api/brand/products
Authorization: Bearer <your-jwt-token>
```

### With Pagination
```bash
GET http://localhost:3000/api/brand/products?page=1&limit=5
Authorization: Bearer <your-jwt-token>
```

### With Filters
```bash
GET http://localhost:3000/api/brand/products?status=active&category=clothing&search=t-shirt
Authorization: Bearer <your-jwt-token>
```

### Complete Example with All Parameters
```bash
GET http://localhost:3000/api/brand/products?page=2&limit=10&status=active&category=clothing&search=premium
Authorization: Bearer <your-jwt-token>
```

---

## 2. POST Create Product

### URL
```bash
POST http://localhost:3000/api/brand/products
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

### Request Body (FormData)
```javascript
// JavaScript example for creating FormData
const formData = new FormData();

// Basic product information
formData.append('name', 'Premium Cotton T-Shirt');
formData.append('description', 'High-quality 100% cotton t-shirt with modern fit');
formData.append('category', 'clothing');
formData.append('subCategory', 't-shirts');
formData.append('originalPrice', '3000');
formData.append('currency', 'PKR');
formData.append('discount', '16.67'); // Price will be auto-calculated: 3000 - (3000 * 16.67/100) = 2500
formData.append('stock', '100');
formData.append('inStock', 'true');
formData.append('gender', 'unisex');
formData.append('material', '100% Cotton');
formData.append('fitType', 'Regular Fit');
formData.append('occasion', 'Casual');
formData.append('careInstructions', 'Machine wash cold, tumble dry low');
formData.append('isFeatured', 'true');
formData.append('status', 'active');

// Arrays (JSON strings)
formData.append('sizes', JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']));
formData.append('colors', JSON.stringify(['White', 'Black', 'Navy Blue', 'Red']));
formData.append('tags', JSON.stringify(['cotton', 'premium', 'casual', 'comfortable']));
formData.append('features', JSON.stringify(['Breathable', 'Soft fabric', 'Durable', 'Easy care']));
formData.append('specifications', JSON.stringify([
  { key: 'Fabric', value: '100% Cotton' },
  { key: 'Weight', value: '180 GSM' },
  { key: 'Origin', value: 'Pakistan' }
]));

// Images (files)
formData.append('thumbnail', thumbnailFile); // File object
formData.append('images', imageFile1); // File object
formData.append('images', imageFile2); // File object
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/brand/products \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "name=Premium Cotton T-Shirt" \
  -F "description=High-quality 100% cotton t-shirt" \
  -F "category=clothing" \
  -F "subCategory=t-shirts" \
  -F "originalPrice=3000" \
  -F "currency=PKR" \
  -F "discount=16.67" \
  -F "stock=100" \
  -F "inStock=true" \
  -F "gender=unisex" \
  -F "material=100% Cotton" \
  -F "fitType=Regular Fit" \
  -F "occasion=Casual" \
  -F "careInstructions=Machine wash cold" \
  -F "isFeatured=true" \
  -F "status=active" \
  -F 'sizes=["XS","S","M","L","XL"]' \
  -F 'colors=["White","Black","Navy Blue"]' \
  -F 'tags=["cotton","premium","casual"]' \
  -F 'features=["Breathable","Soft fabric"]' \
  -F 'specifications=[{"key":"Fabric","value":"100% Cotton"}]' \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

---

## 3. GET Single Product

### URL
```bash
GET http://localhost:3000/api/brand/products/{product-id}
Authorization: Bearer <your-jwt-token>
```

### Example
```bash
GET http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
```

---

## 4. PUT Update Product

### URL
```bash
PUT http://localhost:3000/api/brand/products/{product-id}
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

### Request Body (FormData) - Partial Update
```javascript
const formData = new FormData();

// Only update specific fields
  formData.append('originalPrice', '3000'); // Will recalculate price based on discount
formData.append('stock', '150');
formData.append('inStock', 'true');
formData.append('discount', '26.67');
formData.append('isFeatured', 'false');

// Update arrays
formData.append('colors', JSON.stringify(['White', 'Black', 'Navy Blue', 'Red', 'Green']));
formData.append('tags', JSON.stringify(['cotton', 'premium', 'casual', 'comfortable', 'trendy']));
```

### cURL Example
```bash
curl -X PUT http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "originalPrice=3000" \
  -F "stock=150" \
  -F "inStock=true" \
  -F "discount=26.67" \
  -F "isFeatured=false"
```

### Add Images to Product
```bash
curl -X POST http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011/images \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "index=2"
```

### Delete Images from Product
```bash
curl -X DELETE "http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011/images?indices=0,2,4" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Update Product Thumbnail
```bash
curl -X PUT http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011/thumbnail \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

### Remove Product Thumbnail
```bash
curl -X DELETE http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011/thumbnail \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Request Body (FormData) - Update with New Images
```javascript
const formData = new FormData();

formData.append('name', 'Updated Premium Cotton T-Shirt');
formData.append('description', 'Updated description with new features');
formData.append('price', '2800');

// Add new images (will be appended to existing ones)
formData.append('images', newImageFile1);
formData.append('images', newImageFile2);

// Update thumbnail
formData.append('thumbnail', newThumbnailFile);
```

---

## 5. DELETE Product

### URL
```bash
DELETE http://localhost:3000/api/brand/products/{product-id}
Authorization: Bearer <your-jwt-token>
```

### Example
```bash
DELETE http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
```

### cURL Example
```bash
curl -X DELETE http://localhost:3000/api/brand/products/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 6. GET Product Statistics

### URL
```bash
GET http://localhost:3000/api/brand/products/stats
Authorization: Bearer <your-jwt-token>
```

### Example
```bash
GET http://localhost:3000/api/brand/products/stats
Authorization: Bearer <your-jwt-token>
```

---

## Complete JavaScript Testing Examples

### 1. Create Product with Images
```javascript
async function createProduct() {
  const formData = new FormData();
  
  // Basic info
  formData.append('name', 'Designer Jeans');
  formData.append('description', 'Premium denim jeans with modern cut');
  formData.append('category', 'clothing');
  formData.append('subCategory', 'jeans');
  formData.append('originalPrice', '5000');
  formData.append('currency', 'PKR');
  formData.append('discount', '10');
  formData.append('stock', '50');
  formData.append('inStock', 'true');
  formData.append('gender', 'unisex');
  formData.append('material', '98% Cotton, 2% Elastane');
  formData.append('fitType', 'Slim Fit');
  formData.append('occasion', 'Casual');
  formData.append('careInstructions', 'Machine wash cold, hang dry');
  formData.append('isFeatured', 'true');
  formData.append('status', 'active');
  
  // Arrays
  formData.append('sizes', JSON.stringify(['28', '30', '32', '34', '36', '38']));
  formData.append('colors', JSON.stringify(['Blue', 'Black', 'Light Blue']));
  formData.append('tags', JSON.stringify(['denim', 'premium', 'slim-fit', 'casual']));
  formData.append('features', JSON.stringify(['Stretchable', 'Comfortable', 'Durable']));
  formData.append('specifications', JSON.stringify([
    { key: 'Fabric', value: '98% Cotton, 2% Elastane' },
    { key: 'Fit', value: 'Slim Fit' },
    { key: 'Rise', value: 'Mid Rise' }
  ]));
  
  // Images
  formData.append('thumbnail', thumbnailFile);
  formData.append('images', imageFile1);
  formData.append('images', imageFile2);
  formData.append('images', imageFile3);
  
  try {
    const response = await fetch('http://localhost:3000/api/brand/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Product created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 2. Update Product Stock
```javascript
async function updateProductStock(productId) {
  const formData = new FormData();
  formData.append('stock', '75');
  formData.append('inStock', 'true');
  formData.append('originalPrice', '5000'); // Will recalculate price based on discount
  
  try {
    const response = await fetch(`http://localhost:3000/api/brand/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Product updated:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 3. Get Products with Filters
```javascript
async function getFilteredProducts() {
  const params = new URLSearchParams({
    page: '1',
    limit: '10',
    status: 'active',
    category: 'clothing',
    search: 'premium'
  });
  
  try {
    const response = await fetch(`http://localhost:3000/api/brand/products?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('Products:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 4. Get Product Statistics
```javascript
async function getProductStats() {
  try {
    const response = await fetch('http://localhost:3000/api/brand/products/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('Stats:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 5. Add Images to Product
```javascript
async function addImagesToProduct(productId) {
  const formData = new FormData();
  formData.append('images', imageFile1);
  formData.append('images', imageFile2);
  formData.append('index', '2'); // Insert at index 2
  
  try {
    const response = await fetch(`http://localhost:3000/api/brand/products/${productId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Images added:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 6. Delete Images from Product
```javascript
async function deleteImagesFromProduct(productId) {
  try {
    const response = await fetch(`http://localhost:3000/api/brand/products/${productId}/images?indices=0,2,4`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('Images deleted:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 7. Update Product Thumbnail
```javascript
async function updateProductThumbnail(productId) {
  const formData = new FormData();
  formData.append('thumbnail', thumbnailFile);
  
  try {
    const response = await fetch(`http://localhost:3000/api/brand/products/${productId}/thumbnail`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Thumbnail updated:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 8. Remove Product Thumbnail
```javascript
async function removeProductThumbnail(productId) {
  try {
    const response = await fetch(`http://localhost:3000/api/brand/products/${productId}/thumbnail`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('Thumbnail removed:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Postman Collection

### Environment Variables
```
base_url: http://localhost:3000
token: <your-jwt-token>
product_id: <product-id-from-create-response>
```

### Collection Requests

1. **Create Product**
   - Method: POST
   - URL: `{{base_url}}/api/brand/products`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: form-data with all product fields

2. **Get All Products**
   - Method: GET
   - URL: `{{base_url}}/api/brand/products?page=1&limit=10`
   - Headers: `Authorization: Bearer {{token}}`

3. **Get Single Product**
   - Method: GET
   - URL: `{{base_url}}/api/brand/products/{{product_id}}`
   - Headers: `Authorization: Bearer {{token}}`

4. **Update Product**
   - Method: PUT
   - URL: `{{base_url}}/api/brand/products/{{product_id}}`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: form-data with fields to update

5. **Delete Product**
   - Method: DELETE
   - URL: `{{base_url}}/api/brand/products/{{product_id}}`
   - Headers: `Authorization: Bearer {{token}}`

6. **Get Statistics**
   - Method: GET
   - URL: `{{base_url}}/api/brand/products/stats`
   - Headers: `Authorization: Bearer {{token}}`
