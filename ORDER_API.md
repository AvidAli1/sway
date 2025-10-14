# Order API Documentation

This document describes the Order Management API endpoints for both customers and brands in the Sway application.

## 🛒 **Customer Order Endpoints**

### **1. Place Order (Create Order)**
**POST** `/api/customer/orders`

Creates a new order with automatic stock management.

#### Authentication
Required: Customer JWT token

#### Request Body
```json
{
  "items": [
    {
      "productId": "68ee9863e64b5c42481f00d1",
      "quantity": 2,
      "size": "M",
      "color": "Blue"
    },
    {
      "productId": "68ee9863e64b5c42481f00d2",
      "quantity": 1,
      "size": "L",
      "color": "Black"
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+92-300-1234567",
    "address": "123 Main Street",
    "city": "Karachi",
    "state": "Sindh",
    "postalCode": "75600",
    "country": "Pakistan",
    "landmark": "Near City Mall",
    "addressType": "home"
  },
  "payment": {
    "method": "cash_on_delivery"
  },
  "notes": "Please deliver in the evening",
  "isGift": false,
  "giftMessage": ""
}
```

#### What Happens Automatically:
- ✅ **Stock Validation**: Checks if products are in stock
- ✅ **Stock Reduction**: Reduces product stock by ordered quantity
- ✅ **Out of Stock Update**: Sets `inStock` to false if stock reaches 0
- ✅ **Product Snapshot**: Saves product details at time of order
- ✅ **Order Number**: Generates unique order number (ORD-YYYYMMDD-XXXXXX)
- ✅ **Price Calculation**: Calculates subtotal, tax, shipping, total
- ✅ **Status Tracking**: Initializes status history

#### Response
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "orderNumber": "ORD-20241220-123456",
    "_id": "...",
    "total": 5420,
    "status": "pending",
    "items": 2,
    "estimatedDelivery": "2024-12-27T..."
  }
}
```

---

### **2. Get Order History**
**GET** `/api/customer/orders`

Get customer's order history with pagination.

#### Authentication
Required: Customer JWT token

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

#### Examples
```bash
# Basic
GET /api/customer/orders

# With pagination
GET /api/customer/orders?page=1&limit=10

# Filter by status
GET /api/customer/orders?status=delivered
```

#### Response
```json
{
  "success": true,
  "orders": [
    {
      "_id": "...",
      "orderNumber": "ORD-20241220-123456",
      "items": [...],
      "subtotal": 5000,
      "discount": 0,
      "shippingCost": 200,
      "tax": 420,
      "total": 5420,
      "status": "delivered",
      "payment": {
        "status": "completed"
      },
      "createdAt": "2024-12-20T...",
      "delivery": {
        "estimatedDelivery": "2024-12-27T..."
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalOrders": 42,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

---

### **3. Get Order Details**
**GET** `/api/customer/orders/[id]`

Get detailed information about a specific order.

#### Authentication
Required: Customer JWT token

#### Example
```bash
GET /api/customer/orders/507f1f77bcf86cd799439011
```

#### Response
```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "ORD-20241220-123456",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+92-300-1234567"
    },
    "items": [...],
    "subtotal": 5000,
    "total": 5420,
    "status": "delivered",
    "statusHistory": [...],
    "shippingAddress": {...},
    "payment": {...},
    "delivery": {...}
  }
}
```

---

### **4. Cancel Order**
**PUT** `/api/customer/orders/[id]`

Cancel an order (only if status is pending or confirmed).

#### Authentication
Required: Customer JWT token

#### Request Body
```json
{
  "action": "cancel",
  "reason": "Changed my mind"
}
```

#### What Happens Automatically:
- ✅ **Stock Restoration**: Returns all items back to stock
- ✅ **Inventory Update**: Sets products back to `inStock: true`
- ✅ **Refund Calculation**: Calculates refund if payment was completed
- ✅ **Status Update**: Updates status to cancelled with timestamp

#### Response
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "orderNumber": "ORD-20241220-123456",
    "status": "cancelled",
    "refundAmount": 5420
  }
}
```

---

### **5. Request Return**
**PUT** `/api/customer/orders/[id]`

Request a return for delivered order (within 7 days).

#### Authentication
Required: Customer JWT token

#### Request Body
```json
{
  "action": "request_return",
  "reason": "Product not as described"
}
```

#### Response
```json
{
  "success": true,
  "message": "Return request submitted successfully",
  "order": {
    "orderNumber": "ORD-20241220-123456",
    "returnStatus": "requested"
  }
}
```

---

## 🏢 **Brand Order Endpoints**

### **1. Get Brand Orders**
**GET** `/api/brand/orders`

Get orders containing brand's products.

#### Authentication
Required: Brand JWT token

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `search` (optional): Search by order number, email, or phone

#### Examples
```bash
# Basic
GET /api/brand/orders

# With filters
GET /api/brand/orders?status=pending&page=1&limit=20

# Search
GET /api/brand/orders?search=ORD-20241220
```

#### Response
```json
{
  "success": true,
  "orders": [
    {
      "_id": "...",
      "orderNumber": "ORD-20241220-123456",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [...], // Only brand's products
      "brandSubtotal": 2500,
      "itemCount": 1,
      "status": "pending",
      "createdAt": "..."
    }
  ],
  "pagination": {...}
}
```

---

### **2. Get Order Details (Brand)**
**GET** `/api/brand/orders/[id]`

Get detailed information about a specific order.

#### Authentication
Required: Brand JWT token

#### Example
```bash
GET /api/brand/orders/507f1f77bcf86cd799439011
```

---

### **3. Update Order Status**
**PUT** `/api/brand/orders/[id]`

Update order status and tracking information.

#### Authentication
Required: Brand JWT token

#### Request Body
```json
{
  "status": "shipped",
  "note": "Package dispatched via TCS",
  "trackingNumber": "TCS1234567890",
  "courierService": "TCS Express",
  "estimatedDelivery": "2024-12-25"
}
```

#### Valid Status Transitions
```
pending → confirmed → processing → shipped → out_for_delivery → delivered
    ↓
cancelled (from pending, confirmed, processing)
    ↓
returned → refunded
```

#### What Happens Automatically:
- ✅ **Status Validation**: Ensures valid status transitions
- ✅ **Delivery Date**: Sets actual delivery date when status = delivered
- ✅ **Refund Processing**: Initiates refund if cancelled after payment
- ✅ **Stock Restoration**: Restores stock if order is cancelled
- ✅ **Status History**: Logs all status changes with timestamps

#### Response
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "orderNumber": "ORD-20241220-123456",
    "status": "shipped",
    "delivery": {
      "trackingNumber": "TCS1234567890",
      "courierService": "TCS Express",
      "estimatedDelivery": "2024-12-25T..."
    }
  }
}
```

---

## 📋 **Order Status Flow**

```
Customer Places Order → pending
        ↓
Brand Confirms → confirmed
        ↓
Brand Processes → processing
        ↓
Brand Ships → shipped
        ↓
Out for Delivery → out_for_delivery
        ↓
Delivered → delivered
        ↓
Customer Reviews → reviewStatus: reviewed

[Any stage]
    ↓
cancelled → refunded (if paid)
    ↓
Stock Restored
```

---

## 💰 **Pricing Calculations**

### **Automatic Calculations:**
```javascript
subtotal = Σ(item.price × item.quantity)
shippingCost = subtotal >= 5000 ? 0 : 200
tax = subtotal × 0.08  // 8% tax
total = subtotal - discount + shippingCost + tax
```

---

## 🔐 **Stock Management**

### **On Order Creation:**
1. Validates product availability
2. Checks stock quantity
3. Reduces stock by ordered quantity
4. Sets `inStock: false` if stock reaches 0

### **On Order Cancellation:**
1. Restores stock for all items
2. Sets `inStock: true`
3. Initiates refund if payment was completed

---

## 🧪 **Testing Examples**

### **JavaScript - Place Order**
```javascript
const placeOrder = async () => {
  const orderData = {
    items: [
      {
        productId: "68ee9863e64b5c42481f00d1",
        quantity: 2,
        size: "M",
        color: "Blue"
      }
    ],
    shippingAddress: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+92-300-1234567",
      address: "123 Main Street",
      city: "Karachi",
      state: "Sindh",
      postalCode: "75600",
      country: "Pakistan",
      addressType: "home"
    },
    payment: {
      method: "cash_on_delivery"
    }
  };

  const response = await fetch('/api/customer/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  console.log(result);
};
```

### **cURL - Update Order Status (Brand)**
```bash
curl -X PUT http://localhost:3000/api/brand/orders/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <brand-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "TCS1234567890",
    "courierService": "TCS Express"
  }'
```

---

## ⚠️ **Important Notes**

1. **Stock Management**: All stock operations use MongoDB transactions for data consistency
2. **Order Numbers**: Automatically generated in format `ORD-YYYYMMDD-XXXXXX`
3. **Product Snapshots**: Order items store product details at time of order
4. **Return Window**: 7 days from delivery date
5. **Free Shipping**: Orders over 5000 PKR get free shipping
6. **Tax**: 8% tax applied to all orders

This comprehensive order system handles all aspects of e-commerce order management! 🚀
