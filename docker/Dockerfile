# Use official Node.js image as base
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Build the TypeScript project
#RUN npx ts-node@latest index.ts

# Expose the port your app runs on 
EXPOSE 8005

# Run the app
CMD ["npm", "run","dev"]
