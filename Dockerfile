FROM node:8.16.0-jessie

ENV NODE_ENV production

WORKDIR /app
COPY . .
RUN npm install --production

EXPOSE 8080

CMD ["node", "app.js"]
