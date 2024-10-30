# Stage 1: Build stage
FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package.json ./
COPY tsconfig.json ./
RUN yarn install && yarn cache clean
COPY . .
RUN yarn build && rm -rf node_modules

# Stage 2: Production stage
FROM node:alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN yarn install --production=true && yarn cache clean
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001
CMD [ "yarn", "start" ]
