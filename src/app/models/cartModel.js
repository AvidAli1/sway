import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  size: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  // Store current price at time of adding to cart
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  // Customer who owns this cart
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Each customer can have only one cart
  },
  
  // Cart items
  items: [cartItemSchema],
  
  // Cart totals (calculated)
  subtotal: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Coupon/Promo code
  couponCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  couponDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Cart status
  status: {
    type: String,
    enum: ["active", "converted", "abandoned"],
    default: "active",
  },
  
  // Timestamps
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  abandonedAt: {
    type: Date,
  },
  convertedToOrderAt: {
    type: Date,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  
  // Metadata
  source: {
    type: String,
    enum: ["web", "mobile", "api"],
    default: "web",
  },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate totals
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  this.totalDiscount = this.items.reduce((sum, item) => {
    const itemDiscount = (item.originalPrice - item.price) * item.quantity;
    return sum + itemDiscount;
  }, 0);
  
  // Update last activity
  this.lastActivityAt = new Date();
  
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, size, color, price, originalPrice, discount) {
  // Check if item already exists with same size and color
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    item.size === size &&
    item.color === color
  );
  
  if (existingItemIndex > -1) {
    // Update quantity of existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].updatedAt = new Date();
    this.items[existingItemIndex].price = price; // Update to current price
    this.items[existingItemIndex].originalPrice = originalPrice;
    this.items[existingItemIndex].discount = discount;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      size,
      color,
      price,
      originalPrice,
      discount,
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
    item.updatedAt = new Date();
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.couponCode = null;
  this.couponDiscount = 0;
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(code, discountAmount) {
  this.couponCode = code;
  this.couponDiscount = discountAmount;
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.couponCode = null;
  this.couponDiscount = 0;
  return this.save();
};

// Method to mark cart as abandoned
cartSchema.methods.markAsAbandoned = function() {
  this.status = 'abandoned';
  this.abandonedAt = new Date();
  return this.save();
};

// Method to convert cart to order
cartSchema.methods.convertToOrder = function(orderId) {
  this.status = 'converted';
  this.convertedToOrderAt = new Date();
  this.orderId = orderId;
  return this.save();
};

// Static method to find or create cart for customer
cartSchema.statics.findOrCreateCart = async function(customerId) {
  let cart = await this.findOne({ customer: customerId, status: 'active' });
  
  if (!cart) {
    cart = await this.create({
      customer: customerId,
      items: [],
    });
  }
  
  return cart;
};

// Static method to get abandoned carts
cartSchema.statics.getAbandonedCarts = async function(hoursAgo = 24) {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',
    lastActivityAt: { $lt: cutoffTime },
    totalItems: { $gt: 0 },
  }).populate('customer', 'name email');
};

// Virtual for getting final total (subtotal - couponDiscount)
cartSchema.virtual('total').get(function() {
  return Math.max(0, this.subtotal - this.couponDiscount);
});

// Virtual for getting estimated shipping
cartSchema.virtual('estimatedShipping').get(function() {
  return this.subtotal >= 5000 ? 0 : 200; // Free shipping over 5000
});

// Virtual for getting estimated tax
cartSchema.virtual('estimatedTax').get(function() {
  return Math.round(this.subtotal * 0.08); // 8% tax
});

// Virtual for getting estimated total with shipping and tax
cartSchema.virtual('estimatedTotal').get(function() {
  return this.total + this.estimatedShipping + this.estimatedTax;
});

// Indexes for better performance
cartSchema.index({ customer: 1, status: 1 });
cartSchema.index({ status: 1, lastActivityAt: -1 });
cartSchema.index({ createdAt: -1 });

// Ensure virtuals are included in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
