# Cart API Documentation

This document describes the Cart Management API endpoints for customers in the Sway application.

## 🛒 **Cart Endpoints**

### **Base URL**
All endpoints are prefixed with `/api/customer/cart`

### **Authentication**
All endpoints require Customer JWT token in the Authorization header.

---

## 📋 **Endpoints**

### **1. Get Cart**
**GET** `/api/customer/cart`

Retrieves the customer's current cart with all items and calculations.

#### Authentication
Required: Customer JWT token

#### Request
```bash
GET http://localhost:3000/api/customer/cart
Authorization: Bearer <customer-jwt-token>
```

#### Response
```json
{
  "success": true,
  "cart": {
    "_id": "...",
    "customer": "507f1f77bcf86cd799439011",
    "items": [
      {
        "_id": "item123",
        "product": {
          "_id": "68ee9863e64b5c42481f00d1",
          "name": "Premium Cotton T-Shirt",
          "price": 2500,
          "originalPrice": 3000,
          "discount": 500,
          "images": [...],
          "thumbnail": {...},
          "stock": 50,
          "inStock": true,
          "brand": {
            "name": "Test Brand"
          }
        },
        "quantity": 2,
        "size": "M",
        "color": "Blue",
        "price": 2500,
        "originalPrice": 3000,
        "discount": 500,
        "addedAt": "2024-12-20T..."
      }
    ],
    "subtotal": 5000,
    "totalDiscount": 1000,
    "totalItems": 2,
    "couponCode": "SAVE10",
    "couponDiscount": 500,
    "total": 4500,
    "estimatedShipping": 200,
    "estimatedTax": 400,
    "estimatedTotal": 5100,
    "status": "active"
  },
  "warnings": {
    "unavailableItems": [],
    "priceChanges": []
  }
}
```

---

### **2. Add to Cart**
**POST** `/api/customer/cart`

Adds a product to the cart. If the same product with same size/color exists, it updates the quantity.

#### Authentication
Required: Customer JWT token

#### Request
```bash
POST http://localhost:3000/api/customer/cart
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "productId": "68ee9863e64b5c42481f00d1",
  "quantity": 2,
  "size": "M",
  "color": "Blue"
}
```

#### Minimum Request (without size/color)
```json
{
  "productId": "68ee9863e64b5c42481f00d1",
  "quantity": 1
}
```

#### What Happens Automatically:
- ✅ **Stock Validation**: Checks if product is in stock
- ✅ **Product Availability**: Verifies product is active
- ✅ **Size/Color Validation**: Validates selected options
- ✅ **Smart Merging**: Combines quantities if same item exists
- ✅ **Price Capture**: Stores current product price
- ✅ **Auto Calculations**: Updates all cart totals

#### Response
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {...}
}
```

---

### **3. Update Cart Item Quantity**
**PUT** `/api/customer/cart/[itemId]`

Updates the quantity of a specific cart item.

#### Authentication
Required: Customer JWT token

#### Request
```bash
PUT http://localhost:3000/api/customer/cart/item123
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "quantity": 3
}
```

#### Set quantity to 0 to remove item
```json
{
  "quantity": 0
}
```

#### Response
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "cart": {...}
}
```

---

### **4. Remove Item from Cart**
**DELETE** `/api/customer/cart/[itemId]`

Removes a specific item from the cart.

#### Authentication
Required: Customer JWT token

#### Request
```bash
DELETE http://localhost:3000/api/customer/cart/item123
Authorization: Bearer <customer-jwt-token>
```

#### Response
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": {...}
}
```

---

### **5. Clear Cart**
**DELETE** `/api/customer/cart`

Removes all items from the cart and clears any applied coupons.

#### Authentication
Required: Customer JWT token

#### Request
```bash
DELETE http://localhost:3000/api/customer/cart
Authorization: Bearer <customer-jwt-token>
```

#### Response
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "cart": {
    "items": [],
    "subtotal": 0,
    "totalItems": 0,
    "couponCode": null,
    "couponDiscount": 0
  }
}
```

---

### **6. Apply Coupon**
**POST** `/api/customer/cart/coupon`

Applies a coupon code to the cart.

#### Authentication
Required: Customer JWT token

#### Request
```bash
POST http://localhost:3000/api/customer/cart/coupon
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "couponCode": "SAVE10"
}
```

#### Available Coupons (Demo)
```json
{
  "SAVE10": {
    "type": "percentage",
    "value": 10,
    "minOrder": 1000,
    "description": "10% off on orders above 1000 PKR"
  },
  "SAVE100": {
    "type": "fixed",
    "value": 100,
    "minOrder": 500,
    "description": "Flat 100 PKR off on orders above 500 PKR"
  },
  "SAVE20": {
    "type": "percentage",
    "value": 20,
    "minOrder": 5000,
    "description": "20% off on orders above 5000 PKR"
  },
  "FREESHIP": {
    "type": "shipping",
    "value": 200,
    "minOrder": 0,
    "description": "Free shipping on all orders"
  },
  "WELCOME15": {
    "type": "percentage",
    "value": 15,
    "minOrder": 2000,
    "description": "15% off on orders above 2000 PKR"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "cart": {...},
  "couponDetails": {
    "code": "SAVE10",
    "type": "percentage",
    "discount": 500
  }
}
```

---

### **7. Remove Coupon**
**DELETE** `/api/customer/cart/coupon`

Removes the applied coupon from the cart.

#### Authentication
Required: Customer JWT token

#### Request
```bash
DELETE http://localhost:3000/api/customer/cart/coupon
Authorization: Bearer <customer-jwt-token>
```

#### Response
```json
{
  "success": true,
  "message": "Coupon removed successfully",
  "cart": {...}
}
```

---

## 💰 **Cart Calculations**

### **Automatic Calculations:**
```javascript
subtotal = Σ(item.price × item.quantity)
totalDiscount = Σ((item.originalPrice - item.price) × item.quantity)
totalItems = Σ(item.quantity)

// After coupon
total = subtotal - couponDiscount

// Estimations for checkout
estimatedShipping = subtotal >= 5000 ? 0 : 200
estimatedTax = subtotal × 0.08
estimatedTotal = total + estimatedShipping + estimatedTax
```

---

## 🎯 **Complete Testing Flow**

### **Step 1: View Empty Cart**
```bash
GET http://localhost:3000/api/customer/cart
Authorization: Bearer <token>
```

### **Step 2: Add First Item**
```bash
POST http://localhost:3000/api/customer/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "68ee9863e64b5c42481f00d1",
  "quantity": 2,
  "size": "M",
  "color": "Blue"
}
```

### **Step 3: Add Another Item**
```bash
POST http://localhost:3000/api/customer/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "68ee9af0e64b5c42481f00eb",
  "quantity": 1,
  "size": "L",
  "color": "Black"
}
```

### **Step 4: Update Item Quantity**
```bash
PUT http://localhost:3000/api/customer/cart/ITEM_ID
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### **Step 5: Apply Coupon**
```bash
POST http://localhost:3000/api/customer/cart/coupon
Authorization: Bearer <token>
Content-Type: application/json

{
  "couponCode": "SAVE10"
}
```

### **Step 6: View Updated Cart**
```bash
GET http://localhost:3000/api/customer/cart
Authorization: Bearer <token>
```

### **Step 7: Remove Specific Item**
```bash
DELETE http://localhost:3000/api/customer/cart/ITEM_ID
Authorization: Bearer <token>
```

### **Step 8: Clear Cart**
```bash
DELETE http://localhost:3000/api/customer/cart
Authorization: Bearer <token>
```

---

## ⚠️ **Cart Features**

1. **Auto-Merging**: Same product + size + color = quantity update
2. **Price Locking**: Prices stored at time of adding to cart
3. **Stock Validation**: Validates stock before adding
4. **Price Change Detection**: Warns if product prices changed
5. **Unavailable Items**: Alerts about out-of-stock products
6. **One Cart Per Customer**: Each customer has one active cart
7. **Auto Calculations**: All totals calculated automatically

---

## 🔄 **Cart to Order Flow**

When customer places an order:
1. Cart items are converted to order items
2. Cart status changes to 'converted'
3. Cart is linked to the order
4. New empty cart is created for future shopping

---

## 🧪 **JavaScript Testing Example**

```javascript
// Get cart
async function getCart(token) {
  const response = await fetch('http://localhost:3000/api/customer/cart', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Add to cart
async function addToCart(token, productId, quantity, size, color) {
  const response = await fetch('http://localhost:3000/api/customer/cart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, quantity, size, color })
  });
  return await response.json();
}

// Update quantity
async function updateQuantity(token, itemId, quantity) {
  const response = await fetch(`http://localhost:3000/api/customer/cart/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  });
  return await response.json();
}

// Apply coupon
async function applyCoupon(token, couponCode) {
  const response = await fetch('http://localhost:3000/api/customer/cart/coupon', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ couponCode })
  });
  return await response.json();
}
```

This comprehensive cart system provides a complete shopping cart experience! 🛒🎉
