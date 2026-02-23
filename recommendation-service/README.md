# Recommendation Service

This service generates vector embeddings for text and images using the CLIP model (`clip-ViT-B-32`).

## Setup

1.  **Install Python**: Ensure you have Python installed.
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *(Ideally, use a virtual environment)*

## Running the Server

```bash
python server.py
# or
uvicorn server:app --reload
```

The server will start at `http://localhost:8000`.

## Endpoints

-   `GET /`: Check status.
-   `POST /embed-text`: `{"text": "your text here"}` -> Returns `{"embedding": [...]}`.
-   `POST /embed-image`: Upload an image file -> Returns `{"embedding": [...]}`.
-   `POST /embed-image-url`: `{"url": "http://..."}` -> Returns `{"embedding": [...]}`.
