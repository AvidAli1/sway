# Hosting FashionCLIP API on Hugging Face Spaces

Follow these steps exactly to host your FashionCLIP API for free:

### 1. Create a Hugging Face Account
Go to [huggingface.co](https://huggingface.co/) and create a free account if you don't already have one.

### 2. Create a New Space
1. Click on your profile picture in the top right corner.
2. Click **"+ New Space"**.
3. Fill in the details:
   - **Space name**: `sway-recommendation-api` (or whatever you prefer)
   - **License**: `mit` (or leave blank)
   - **Select the Space SDK**: Click on **Docker** and choose the **Blank** template.
   - **Space Hardware**: Leave it as the free **Blank (CPU basic, 2 vCPU, 16GB RAM)**.
   - **Visibility**: Set it to **Public**
4. Click **Create Space**.

### 3. Upload Your Files
You need to upload 3 specific files from your local `recommendation-service` folder into this new Space.
You can do this directly from the browser:
1. In your new Space, click on the **Files** tab.
2. Click **+ Add file** > **Upload files**.
3. Upload the following 3 files located in `e:\SWAY\sway\recommendation-service\`:
   - `server.py`
   - `requirements.txt`
   - `Dockerfile`
4. Write a small commit message like "Initial upload" and click **Commit changes to main**.

### 4. Wait for it to Build
Once you click commit, Hugging Face will automatically read your `Dockerfile` and start building your environment.
1. Click on the **App** tab.
2. You will see a "Building..." status. This usually takes about 2-3 minutes as it installs PyTorch and FashionCLIP.
3. Once it says **Running**, your API is live!

### 5. Get Your API URL
Click the "three dots" icon (Options) in the top right corner of the Space, and click **Embed this Space**.
You will see a "Direct URL" that looks something like this:
`https://yourusername-sway-recommendation-api.hf.space`

### 6. Update Your Sway Code
Now that your API is hosted, update your `.env` or anywhere in your code where you previously used `http://127.0.0.1:8000`.

**In `src/app/api/customer/products/route.js`:**
```javascript
// Change this line:
const embedRes = await fetch("http://127.0.0.1:8000/embed-text", ...)

// To exactly this (using your new Space URL):
const embedRes = await fetch("https://yourusername-sway-recommendation-api.hf.space/embed-text", ...)
```

Do the same for any other routes (like the brand upload page or user profile page) that call the old `8000` port.

### Notes on Sleep Mode:
If nobody uses the recommendation system for 48 hours, Hugging Face puts the Space to sleep. 
The next time someone visits your site and needs it, the first request will take about 1-2 minutes to wake the server back up. After it's awake, it will be fast again.
