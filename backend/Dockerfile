FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node . .
USER node

EXPOSE 4000
CMD ["npm", "start"]
