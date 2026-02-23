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

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Products || mongoose.model('Products', productSchema, 'products');

const brandSchema = new mongoose.Schema({}, { strict: false });
const Brand = mongoose.models.Brands || mongoose.model('Brands', brandSchema, 'brands');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.Users || mongoose.model('Users', userSchema, 'users');

(async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB");

        // 1. List all Brands and their Owners
        const brands = await Brand.find({});
        console.log("\n--- BRANDS ---");
        for (const brand of brands) {
            console.log(`Brand: ${brand.name}, ID: ${brand._id}, Owner: ${brand.owner}`);
        }

        // 2. List all Products and their Brand IDs
        const products = await Product.find({});
        console.log("\n--- PRODUCTS ---");
        for (const p of products) {
            console.log(`Product: ${p.name}, ID: ${p._id}, Brand: ${p.brand}`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
})();
