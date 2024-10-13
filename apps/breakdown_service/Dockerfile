# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and yarn.lock from the root
COPY package.json yarn.lock ./

# Copy turbo.json if it exists
COPY turbo.json* ./

# Copy workspace configurations
COPY apps/breakdown_service/package.json ./apps/breakdown_service/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY --from=deps /app/turbo.json* ./

# Copy source code
COPY apps ./apps
COPY packages ./packages

# Ensure Turbo is in the PATH
ENV PATH /app/node_modules/.bin:$PATH

# Build all packages and the breakdown_service
RUN yarn turbo run build --filter=@breakdownrescue/breakdown_service...

# Stage 3: Create a minimal image for running the application
FROM public.ecr.aws/lambda/nodejs:20 AS runner
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built assets from the builder stage
COPY --from=builder /app/apps/breakdown_service/dist ./

# Copy only production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
RUN yarn install --production --frozen-lockfile

# Copy the built database package
COPY --from=builder /app/packages/database/dist ./node_modules/@breakdownrescue/database

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set the CMD to point to the handler function
CMD [ "server.handler" ]
