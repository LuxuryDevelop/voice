FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  make \
  g++ \
  build-essential \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 4000
EXPOSE 40000-49999/udp

CMD ["npm", "run", "start"]

