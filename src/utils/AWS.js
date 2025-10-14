const AWS = require("aws-sdk");
const sharp = require("sharp");

require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadFile = async (fileBuffer, fileName, contentType) => {
  console.log("Uploading image");

  try {
    // Extract file extension
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Allowed image formats
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];

    // Validate file type
    if (
      !allowedExtensions.includes(fileExtension) ||
      !allowedMimeTypes.includes(contentType)
    ) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${Date.now()}_${fileName}`, // Store in an 'images/' folder with a timestamp
      Body: fileBuffer,
      ContentType: contentType,
    };

    const data = await s3.upload(params).promise();
    console.log("Image uploaded successfully! URL: ", data.Location);
    return data.Location;
  } catch (err) {
    console.error("Error uploading image:", err.message);
    throw err;
  }
};

const uploadProductImages = async (fileBuffer, fileName, contentType) => {
  console.log("Processing and uploading product images");

  try {
    // Extract file extension and base name
    const fileExtension = fileName.split(".").pop().toLowerCase();
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();

    // Allowed image formats
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];

    // Validate file type
    if (
      !allowedExtensions.includes(fileExtension) ||
      !allowedMimeTypes.includes(contentType)
    ) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Process images with Sharp
    const hdImageBuffer = await sharp(fileBuffer)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    const sdImageBuffer = await sharp(fileBuffer)
      .resize(600, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Upload HD image (JPEG)
    const hdParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `products/hd/${timestamp}_${baseName}_hd.jpg`,
      Body: hdImageBuffer,
      ContentType: "image/jpeg",
    };

    // Upload SD image (WebP)
    const sdParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `products/sd/${timestamp}_${baseName}_sd.webp`,
      Body: sdImageBuffer,
      ContentType: "image/webp",
    };

    // Upload both images in parallel
    const [hdData, sdData] = await Promise.all([
      s3.upload(hdParams).promise(),
      s3.upload(sdParams).promise()
    ]);

    console.log("Product images uploaded successfully!");
    console.log("HD URL:", hdData.Location);
    console.log("SD URL:", sdData.Location);

    return {
      HD: hdData.Location,
      SD: sdData.Location
    };
  } catch (err) {
    console.error("Error processing and uploading product images:", err.message);
    throw err;
  }
};

module.exports = { uploadFile, uploadProductImages };
