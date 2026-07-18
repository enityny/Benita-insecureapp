FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm ci --only=production

RUN mkdir -p public/uploads data

EXPOSE 3000

CMD ["sh", "-c", "node seed.js && node server.js"]
