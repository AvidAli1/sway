# MongoDB Atlas Vector Search Setup

To enable the recommendation system, you **must** create a Vector Search Index on your `products` collection in MongoDB Atlas.

## Steps

1.  **Log in to MongoDB Atlas**.
2.  Navigate to your **Cluster**.
3.  Click on the **Atlas Search** tab (or **Search** tab).
4.  Click **Create Search Index**.
5.  Select **Vector Search** (JSON Editor).
6.  Select your **Database** and the **`products` Collection**.
7.  Name the index: `vector_index`.
8.  Paste the following JSON configuration into the editor:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 512,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "season"
    },
    {
      "type": "filter",
      "path": "inStock"
    }
  ]
}
```

9.  Click **Next** / **Create Search Index**.
10. Wait for the index to build (it may take a few minutes).

## Important Notes

-   **Dimension**: This configuration uses `512` dimensions, which matches the output of the CLIP `ViT-B-32` model used in the Python service. If you change the model, you must update this number.
-   **Filters**: We added `season` and `inStock` as filter fields so we can efficiently filter results *before* or *during* the vector search.
