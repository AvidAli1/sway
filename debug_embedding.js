const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

// Connect DB
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (e) {
        console.error("DB Connect Error:", e);
        process.exit(1);
    }
};

// Simple loose schemas
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Products || mongoose.model('Products', productSchema, 'products');

const customerSchema = new mongoose.Schema({}, { strict: false });
const Customer = mongoose.models.Customers || mongoose.model('Customers', customerSchema, 'customers');

(async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB");

        // 1. Check Product with embedding
        const product = await Product.findOne({ embedding: { $exists: true, $ne: [] } });
        if (product) {
            console.log("\n--- FOUND PRODUCT WITH EMBEDDING ---");
            console.log("ID:", product._id);
            console.log("Name:", product.name);
            console.log("Price:", product.price);
            console.log("Season:", product.season);
            console.log("InStock:", product.inStock);
            console.log("Status:", product.status);
            console.log("Embedding Length:", product.embedding ? product.embedding.length : 0);
        } else {
            console.log("\n--- NO PRODUCT WITH EMBEDDING FOUND ---");
            // Check if any product has embedding field at all
            const count = await Product.countDocuments({ embedding: { $exists: true } });
            console.log("Count of products with embedding field:", count);
        }

        // 2. Check Customer with style embedding
        // We'll just look for one with styleEmbedding > 0 length
        const customer = await Customer.findOne({ "styleEmbedding.0": { $exists: true } });
        if (customer) {
            console.log("\n--- FOUND CUSTOMER WITH STYLE EMBEDDING ---");
            console.log("Customer ID:", customer._id);
            console.log("User ID:", customer.userId);
            console.log("Style Preferences:", customer.stylePreferences);
            console.log("Style Embedding Length:", customer.styleEmbedding ? customer.styleEmbedding.length : 0);
        } else {
            console.log("\n--- NO CUSTOMER WITH SUBSTANTIAL STYLE EMBEDDING FOUND ---");
            const anyCustomer = await Customer.findOne({});
            console.log("Example Customer (if any):", anyCustomer ? anyCustomer._id : "None");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
})();
