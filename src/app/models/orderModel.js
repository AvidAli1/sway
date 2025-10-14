import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
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
  size: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  // Store product snapshot at time of order
  productSnapshot: {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    images: [{
      HD: String,
      SD: String,
    }],
    thumbnail: {
      HD: String,
      SD: String,
    },
    brand: {
      name: String,
      businessEmail: String,
    },
    sku: String,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: "Pakistan",
  },
  landmark: {
    type: String,
    trim: true,
  },
  addressType: {
    type: String,
    enum: ["home", "office", "other"],
    default: "home",
  },
});

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["cash_on_delivery", "credit_card", "debit_card", "bank_transfer", "wallet", "upi"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded", "partially_refunded"],
    default: "pending",
  },
  transactionId: {
    type: String,
    trim: true,
  },
  paymentGateway: {
    type: String,
    trim: true,
  },
  paidAt: {
    type: Date,
  },
  refundedAt: {
    type: Date,
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundReason: {
    type: String,
    trim: true,
  },
});

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  
  // Customer information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Pricing breakdown
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Currency
  currency: {
    type: String,
    default: "PKR",
    uppercase: true,
  },
  
  // Shipping information
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  
  // Payment information
  payment: {
    type: paymentInfoSchema,
    required: true,
  },
  
  // Order status and tracking
  status: {
    type: String,
    enum: [
      "pending",           // Order placed, awaiting confirmation
      "confirmed",         // Order confirmed by brand
      "processing",        // Order being prepared
      "shipped",          // Order shipped
      "out_for_delivery", // Out for delivery
      "delivered",        // Order delivered
      "cancelled",        // Order cancelled
      "returned",         // Order returned
      "refunded"          // Order refunded
    ],
    default: "pending",
  },
  
  // Status history for tracking
  statusHistory: [{
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  }],
  
  // Delivery information
  delivery: {
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    courierService: {
      type: String,
      trim: true,
    },
    deliveryNotes: {
      type: String,
      trim: true,
    },
  },
  
  // Order notes and communication
  notes: {
    customer: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    internal: {
      type: String,
      trim: true,
    },
  },
  
  // Cancellation information
  cancellation: {
    reason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
  },
  
  // Return information
  return: {
    reason: {
      type: String,
      trim: true,
    },
    requestedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    returnedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    returnStatus: {
      type: String,
      enum: ["requested", "approved", "rejected", "returned", "refunded"],
    },
  },
  
  // Order source and metadata
  source: {
    type: String,
    enum: ["web", "mobile", "api"],
    default: "web",
  },
  
  // Flags
  isGift: {
    type: Boolean,
    default: false,
  },
  giftMessage: {
    type: String,
    trim: true,
  },
  
  // Review tracking
  reviewStatus: {
    type: String,
    enum: ["pending", "reviewed", "skipped"],
    default: "pending",
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate order number: ORD-YYYYMMDD-XXXXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.orderNumber = `ORD-${dateStr}-${randomNum}`;
    
    // Add initial status to history
    this.statusHistory = [{
      status: this.status,
      timestamp: new Date(),
      note: 'Order created',
    }];
  }
  
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || '',
    updatedBy: updatedBy,
  });
  return this.save();
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  this.total = this.subtotal - this.discount + this.shippingCost + this.tax;
  return this;
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(customerId) {
  const stats = await this.aggregate([
    { $match: { customer: customerId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    }
  ]);
  
  return stats;
};

// Indexes for better performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
