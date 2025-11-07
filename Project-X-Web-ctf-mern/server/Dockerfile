FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src ./src
RUN useradd -m ctfuser && chown -R ctfuser:ctfuser /app
USER ctfuser
EXPOSE 8100
CMD ["node", "src/index.js"]
