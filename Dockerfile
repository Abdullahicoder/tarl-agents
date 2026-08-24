FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure Python treats /app as the root module search directory
ENV PYTHONPATH=/app
ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "deploy.main:app", "--host", "0.0.0.0", "--port", "8080"]
