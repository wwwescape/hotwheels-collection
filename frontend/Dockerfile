FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm config set legacy-peer-deps true
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 1602
CMD ["serve", "build", "-l", "1602"]