# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies, including devDependencies to compile TypeScript
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Create a minimal image for the application
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 9000

# Define the command to run the app
CMD ["npm", "start"]
