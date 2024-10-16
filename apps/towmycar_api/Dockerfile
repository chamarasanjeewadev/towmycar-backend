# Stage 1: Build the application
FROM public.ecr.aws/lambda/nodejs:20 AS builder

# Set the working directory inside the container
WORKDIR ${LAMBDA_TASK_ROOT}

# Enable corepack for yarn support
RUN corepack enable

# Copy package.json, yarn.lock, and workspace configurations
COPY package.json yarn.lock turbo.json ./
COPY apps/towmycar_api/package.json ./apps/towmycar_api/
COPY packages/database/package.json ./packages/database/

# Install dependencies using Turbo
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build all packages and the towmycar_api
RUN yarn turbo run build --filter=@towmycar/api...

# Final stage
FROM public.ecr.aws/lambda/nodejs:20

# The working directory is already set to ${LAMBDA_TASK_ROOT} which is /var/task

# Copy built assets from the builder stage
COPY --from=builder ${LAMBDA_TASK_ROOT}/apps/towmycar_api/dist ./

# Copy only the necessary production dependencies
COPY --from=builder ${LAMBDA_TASK_ROOT}/node_modules ./node_modules
COPY --from=builder ${LAMBDA_TASK_ROOT}/packages/database/dist ./node_modules/@towmycar/database

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set the CMD to point to the handler function
CMD [ "server.handler" ]
