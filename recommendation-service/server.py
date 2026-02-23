import os
import io
import requests
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from PIL import Image
from sentence_transformers import SentenceTransformer, models

app = FastAPI()

# Initialize the model
print("Loading FashionCLIP model...")
clip = models.CLIPModel('patrickjohncyh/fashion-clip')
model = SentenceTransformer(modules=[clip])
print("FashionCLIP model loaded.")

class TextRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "online", "model": "patrickjohncyh/fashion-clip"}

@app.post("/embed-text")
async def embed_text(request: TextRequest):
    try:
        # Generate embedding for text
        embedding = model.encode(request.text)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed-image")
async def embed_image(file: UploadFile = File(...)):
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Generate embedding for image
        embedding = model.encode(image)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        from sentence_transformers import util
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Predefined clothing and style features
        feature_labels = [
            "red", "blue", "green", "black", "white", "yellow", "pink", "purple", "grey", "brown",
            "shirt", "t-shirt", "pants", "jeans", "dress", "skirt", "jacket", "coat", "hoodie", "sweater", "shoes", "sneakers", "boots",
            "casual", "formal", "sportswear", "elegant", "streetwear", "vintage",
            "striped", "floral", "plaid", "solid color", "polka dot", "graphic print",
            "cotton", "leather", "denim", "silk", "wool"
        ]
        
        # Create text prompts
        text_prompts = [f"a photo of a {label} clothing item" for label in feature_labels]
        
        # Generate embeddings
        image_embedding = model.encode(image, convert_to_tensor=True)
        text_embeddings = model.encode(text_prompts, convert_to_tensor=True)
        
        # Compute cosine similarities
        cos_scores = util.cos_sim(image_embedding, text_embeddings)[0]
        
        # Get top 10 features
        import torch
        top_results = torch.topk(cos_scores, k=10)
        
        extracted_features = []
        for score, idx in zip(top_results[0], top_results[1]):
            # Only include features with a decent confidence (score > 0.2, adjustable)
            if score.item() > 0.2:
                extracted_features.append({
                    "feature": feature_labels[idx],
                    "score": float(score.item())
                })
                
        return {"features": extracted_features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed-image-url")
async def embed_image_url(item: dict):
    # Expects {"url": "http://..."}
    url = item.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content))
        
        embedding = model.encode(image)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
