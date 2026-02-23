from sentence_transformers import SentenceTransformer, models
import torch

try:
    print("Loading fashion-clip with CLIPModel wrapper...")
    clip = models.CLIPModel('patrickjohncyh/fashion-clip')
    model = SentenceTransformer(modules=[clip])
    print("Success loading fashion-clip")
    from PIL import Image
    import requests
    from io import BytesIO
    print("Testing image encode...")
    response = requests.get("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3")
    img = Image.open(BytesIO(response.content))
    emb = model.encode(img)
    print("Emb shape:", emb.shape)
except Exception as e:
    import traceback
    traceback.print_exc()
