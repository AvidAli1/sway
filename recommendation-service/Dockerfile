FROM python:3.9-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Set up a new user named "user" with user ID 1000
# Hugging Face Spaces require running as a non-root user
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy the application files
COPY --chown=user . $HOME/app

# Start the FastAPI server on port 7860 (Hugging Face default)
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]
