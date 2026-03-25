FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY monorepo/database/package.json ./monorepo/database/
COPY monorepo/backend/package.json ./monorepo/backend/

RUN npm ci

COPY monorepo/database ./monorepo/database
COPY monorepo/backend ./monorepo/backend

RUN npm run generate --workspace=@exam-manager/database
RUN npm run build --workspace=@exam-manager/backend

EXPOSE 3001

CMD ["node", "monorepo/backend/dist/main.js"]
