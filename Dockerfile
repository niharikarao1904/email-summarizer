FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip --no-cache-dir install -r requirements.txt

COPY backend/ .

EXPOSE 5000

ENV PORT=5000
ENV FLASK_ENV=production
CMD ["gunicorn", "app:app", "-w", "4", "-b", "0.0.0.0:5000"]