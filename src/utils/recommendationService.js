const RECOMMENDATION_SERVICE_URL = 'http://localhost:8000';

/**
 * Generate embedding for a text string.
 * @param {string} text 
 * @returns {Promise<number[]>} Vector embedding
 */
export async function getTextEmbedding(text) {
    try {
        const response = await fetch(`${RECOMMENDATION_SERVICE_URL}/embed-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error(`Recommendation Service Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error('Error generating text embedding:', error);
        return null; // Fail gracefully
    }
}

/**
 * Generate embedding for an image URL.
 * @param {string} url 
 * @returns {Promise<number[]>} Vector embedding
 */
export async function getImageEmbeddingFromUrl(url) {
    try {
        const response = await fetch(`${RECOMMENDATION_SERVICE_URL}/embed-image-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error(`Recommendation Service Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error('Error generating image embedding from URL:', error);
        return null;
    }
}

/**
 * Generate embedding for an image Buffer (during upload).
 * @param {Buffer} buffer 
 * @param {string} filename 
 * @returns {Promise<number[]>} Vector embedding
 */
export async function getImageEmbeddingFromBuffer(buffer, filename) {
    try {
        const formData = new FormData();
        const blob = new Blob([buffer]); // Node.js fetch might need specific handling for Blob/File

        // In Node environment, we might need 'form-data' package or similar if native FormData isn't fully supported with Buffers the way we expect.
        // However, since Next.js uses web-standard Fetch API, let's try constructing a Request with FormData.
        // Note: For server-side file uploads, it's often easier to just send the buffer if the service accepts it.
        // But our python service expects 'multipart/form-data'. 

        // Let's use 'undici' or standard fetch. 
        // A robust way in Node is using 'form-data' library, but let's try to stick to standard fetch if possible.
        // Since `Blob` is available in recent Node/Next.js versions:

        formData.append('file', blob, filename);

        const response = await fetch(`${RECOMMENDATION_SERVICE_URL}/embed-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Recommendation Service Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    } catch (error) {
        console.error('Error generating image embedding from Buffer:', error);
        return null;
    }
}

/**
 * Analyze an image Buffer (during upload) to extract features.
 * @param {Buffer} buffer 
 * @param {string} filename 
 * @returns {Promise<Array<{feature: string, score: number}>>} Extracted features
 */
export async function analyzeImageFromBuffer(buffer, filename) {
    try {
        const formData = new FormData();
        const blob = new Blob([buffer]);
        formData.append('file', blob, filename);

        const response = await fetch(`${RECOMMENDATION_SERVICE_URL}/analyze-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Recommendation Service Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.features;
    } catch (error) {
        console.error('Error analyzing image from Buffer:', error);
        return null;
    }
}
