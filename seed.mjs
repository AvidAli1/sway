import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Vibrant = require('node-vibrant/node');
const nearestColor = require('nearest-color');
const AWSUtils = require('./src/utils/AWS.js');

dotenv.config();

const { uploadProductImages } = AWSUtils;

mongoose.connect(process.env.MONGODB_URI);

const brandSchema = new mongoose.Schema({
    name: String,
    businessEmail: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { collection: 'brands' });

// We need a fuller schema for Product to save all fields properly.
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    slug: { type: String, unique: true, lowercase: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: String, required: true },
    subCategory: String,
    tags: [String],
    features: [String],
    originalPrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'PKR' },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    sizes: [String],
    colors: [String],
    sku: { type: String, unique: true },
    images: [{
        HD: String,
        SD: String
    }],
    thumbnail: {
        HD: String,
        SD: String
    },
    virtualTryOnImage: {
        HD: String,
        SD: String
    },
    gender: { type: String, default: "unisex" },
    material: String,
    fitType: String,
    occasion: String,
    careInstructions: String,
    season: { type: String, default: "All Seasons" },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, default: "active" },
}, { timestamps: true, collection: 'products' });

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const colorsMap = {
    Red: '#FF0000', Green: '#00FF00', Blue: '#0000FF', Yellow: '#FFFF00',
    Orange: '#FFA500', Purple: '#800080', Pink: '#FFC0CB', Brown: '#A52A2A',
    Black: '#000000', White: '#FFFFFF', Gray: '#808080', Beige: '#F5F5DC',
    Navy: '#000080', Olive: '#808000', Maroon: '#800000', Teal: '#008080',
};
const getColorName = nearestColor.from(colorsMap);

async function getDominantColor(buffer) {
    try {
        const palette = await Vibrant.from(buffer).getPalette();
        const hex = (palette.Vibrant || palette.Muted || palette.DarkVibrant || { hex: '#000000' }).hex;
        return getColorName(hex).name;
    } catch (e) {
        return 'Black';
    }
}

function getCategoryInfo(basename) {
    const nameStr = basename.toLowerCase();
    let category = "Clothing", subCategory = "Casual", department = "unisex";

    if (nameStr.includes("bag")) {
        category = "Accessories";
        subCategory = "Bags";
    } else if (nameStr.includes("dress")) {
        category = "Dresses";
        subCategory = "Midi Dresses";
        department = "women";
    } else if (nameStr.includes("jeans") || nameStr.includes("pants")) {
        category = "Pants";
        subCategory = "Jeans";
    } else if (nameStr.includes("hoodie")) {
        category = "Activewear";
        subCategory = "Hoodies";
    } else if (nameStr.includes("jacket")) {
        category = "Outerwear";
        subCategory = "Jackets";
    } else if (nameStr.includes("shoes")) {
        category = "Footwear";
        subCategory = "Sneakers";
    } else if (nameStr.includes("tshirt") || nameStr.includes("shirt")) {
        category = "Shirts";
        subCategory = "T-Shirts";
    }

    const title = basename
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    return { category, subCategory, department, title };
}

async function runSeeder() {
    try {
        console.log("Starting seeder...");
        const emails = [
            "contact@nike.com", "contact@adidas.com", "contact@zara.com",
            "contact@h-m.com", "contact@gucci.com", "contact@uniqlo.com",
            "contact@puma.com", "contact@levis.com", "contact@ralph-lauren.com",
            "contact@north-face.com"
        ];
        const brands = await Brand.find({ businessEmail: { $in: emails } });
        if (brands.length === 0) throw new Error("No brands found!");
        console.log(`Found ${brands.length} brands.`);

        const dir = path.join(process.cwd(), 'public', 'products_page');
        const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

        const groups = {};
        for (const file of files) {
            // Group logic: "tshirt_2.1.jpeg" -> "tshirt_2"
            // "oversized_tshirt.jpg" -> "oversized_tshirt"
            const match = file.match(/^(.*?)(\.\d+)?\.(jpeg|jpg|png|webp)$/i);
            const base = (match && match[1]) ? match[1] : path.parse(file).name;

            if (!groups[base]) groups[base] = [];
            groups[base].push(file);
        }

        const vtryonTargets = ["jeans_1.1.jpeg", "tshirt_2.1.jpeg", "tshirt_3.1.jpeg", "tshirt_4.1.jpeg"];

        let brandIdx = 0;

        for (const [base, imageFiles] of Object.entries(groups)) {
            console.log(`Processing product: ${base} with ${imageFiles.length} images...`);

            const brand = brands[brandIdx % brands.length];
            brandIdx++;

            const { category, subCategory, department, title } = getCategoryInfo(base);

            // Calculate Product Data
            const originalPrice = Math.floor(Math.random() * (15000 - 3000) + 3000);
            const discount = Math.floor(Math.random() * 30); // 0 to 30% discount
            let calculatedPrice = originalPrice - (originalPrice * discount / 100);
            calculatedPrice = Math.ceil(calculatedPrice / 5) * 5;

            const name = `${brand.name} ${title}`;
            const existingProduct = await Product.findOne({ name });
            if (existingProduct) {
                console.log(`Skipping already seeded product: ${name}`);
                continue;
            }

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
            const sku = `${brand.name.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            let dominantColor = 'Black';
            const uploadedImages = [];
            let thumbnail = null;
            let virtualTryOnImage = null;

            // Sort files so .1 comes first
            imageFiles.sort();

            for (let i = 0; i < imageFiles.length; i++) {
                const filename = imageFiles[i];
                const filepath = path.join(dir, filename);
                const buffer = fs.readFileSync(filepath);
                const ext = path.extname(filename).substring(1);
                const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

                if (i === 0) {
                    dominantColor = await getDominantColor(buffer);
                }

                console.log(`Uploading ${filename} to AWS...`);
                let s3Result;
                try {
                    s3Result = await uploadProductImages(buffer, filename, mime);
                } catch (err) {
                    console.log(`Failed to upload ${filename}, using placeholder...`);
                    s3Result = { HD: 'https://placehold.co/1200x1200.jpg', SD: 'https://placehold.co/600x600.jpg' };
                }

                uploadedImages.push(s3Result);

                if (i === 0) {
                    thumbnail = s3Result;
                }

                if (vtryonTargets.includes(filename)) {
                    console.log(`Saving ${filename} as virtual try-on image!`);
                    virtualTryOnImage = s3Result;
                }
            }

            const productDoc = new Product({
                name,
                description: `A premium quality ${title} from ${brand.name}.`,
                slug,
                brand: brand._id,
                category,
                subCategory,
                originalPrice,
                price: calculatedPrice,
                discount,
                stock: 50,
                inStock: true,
                sizes: ['S', 'M', 'L', 'XL'],
                colors: [dominantColor],
                sku,
                images: uploadedImages,
                thumbnail,
                virtualTryOnImage,
                gender: department,
                season: 'All Seasons',
                status: 'active',
                isFeatured: Math.random() > 0.8
            });

            await productDoc.save();
            console.log(`Saved product: ${name}`);
        }

        console.log("Seeding complete!");
        process.exit(0);

    } catch (e) {
        console.error("Error seeding:", e);
        process.exit(1);
    }
}

runSeeder();
