FROM node:22.13.1-alpine AS builder
WORKDIR /app
COPY package*.json .

RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:22.13.1-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 5173

ENV NODE_ENV=production
ENV PORT=5173
# ENV ORIGIN=http://localhost:5173
ENV BODY_SIZE_LIMIT=5M

CMD [ "npm", "run", "production" ]