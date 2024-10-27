# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock from the root
COPY package.json yarn.lock ./

# Copy turbo.json if it exists
COPY turbo.json* ./

# Copy the entire apps directory
COPY apps ./apps

# Copy the packages directory
COPY packages ./packages

# Install dependencies, including Turborepo
RUN yarn install

# Ensure Turbo is in the PATH
ENV PATH /app/node_modules/.bin:$PATH

# Build all packages and the finder_service
RUN yarn turbo run build --filter=@towmycar/finder_service...

# Stage 2: Create a minimal image for running the application
FROM public.ecr.aws/lambda/nodejs:20

# Set the working directory to the Lambda function root
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built assets from the builder stage
COPY --from=builder /app/apps/finder_service/dist ./

# Copy the entire node_modules directory
COPY --from=builder /app/node_modules ./node_modules

# Copy the built database package (if used by finder_service)
COPY --from=builder /app/packages/database/dist ./node_modules/@towmycar/database
COPY --from=builder /app/packages/common/dist ./node_modules/@towmycar/common

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set the CMD to point to the handler function
CMD [ "server.handler" ]
