# Use official Node.js image as a base image
FROM node:22.14.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the app port
EXPOSE 5000

# Command to run the app
CMD ["npm", "run", "dev"]