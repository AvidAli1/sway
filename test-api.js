// Simple test script for Brand Product API
// Run this in browser console or Node.js

const API_BASE = 'http://localhost:3000/api/brand/products';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test 1: Create a simple product
async function testCreateProduct() {
  const formData = new FormData();
  
  // Basic required fields
  formData.append('name', 'Test Product');
  formData.append('category', 'clothing');
  formData.append('originalPrice', '1000');
  formData.append('discount', '10');
  
  // Optional fields
  formData.append('description', 'This is a test product');
  formData.append('currency', 'PKR');
  formData.append('stock', '50');
  formData.append('inStock', 'true');
  formData.append('gender', 'unisex');
  
  try {
    console.log('Creating product...');
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
    
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test 2: Get all products
async function testGetProducts() {
  try {
    console.log('Getting products...');
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
    
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test 3: Get product stats
async function testGetStats() {
  try {
    console.log('Getting stats...');
    const response = await fetch(`${API_BASE}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
    
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
console.log('Starting API tests...');
console.log('Make sure to replace TOKEN with your actual JWT token');

// Uncomment the tests you want to run:
// testCreateProduct();
// testGetProducts();
// testGetStats();
