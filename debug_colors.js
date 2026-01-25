const http = require('http');

const url = 'http://localhost:3000/api/customer/products?limit=10';

console.log(`Fetching ${url}...`);

http.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("--- API RESPONSE DEBUG ---");
            if (json.filters && json.filters.colors) {
                console.log("Filters.colors (Distinct List):", JSON.stringify(json.filters.colors));
            } else {
                console.log("Filters.colors is MISSING or undefined");
                console.log("Keys in filters:", json.filters ? Object.keys(json.filters) : "No filters obj");
            }

            console.log("--- PRODUCT SAMPLE DEBUG ---");
            if (json.products && json.products.length > 0) {
                // limit to 5
                json.products.slice(0, 5).forEach((p, i) => {
                    console.log(`Product ${i} [${p.name || p._id}]: colors=${JSON.stringify(p.colors)}`);
                });
            } else {
                console.log("No products returned in sample query.");
            }

        } catch (e) {
            console.error("Failed to parse JSON:", e);
            console.log("Raw output start:", data.substring(0, 100));
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});
