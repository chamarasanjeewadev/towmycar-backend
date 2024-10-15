# Stage 1: Build the application
FROM public.ecr.aws/lambda/nodejs:20 AS builder

# Set the working directory inside the container
WORKDIR /var/task

# Enable corepack for yarn support
RUN corepack enable

# Copy package.json, yarn.lock, and turbo.json (if it exists)
COPY package.json yarn.lock ./
COPY turbo.json* ./

# Copy package.json files from apps and packages
COPY apps/*/package.json ./apps/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN corepack yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Ensure Turbo is in the PATH
ENV PATH /var/task/node_modules/.bin:$PATH

# Build all packages and the towmycar_api
RUN corepack yarn turbo run build --filter=@towmycar/api...

# Stage 2: Create a minimal image for running the application
FROM public.ecr.aws/lambda/nodejs:20

# Copy built assets from the builder stage
COPY --from=builder /var/task/apps/towmycar_api/dist ${LAMBDA_TASK_ROOT}/

# Copy the entire node_modules directory
COPY --from=builder /var/task/node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Copy the built database package
COPY --from=builder /var/task/packages/database/dist ${LAMBDA_TASK_ROOT}/node_modules/@towmycar/database

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set the CMD to point to the handler function
CMD [ "server.handler" ]
