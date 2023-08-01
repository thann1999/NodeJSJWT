FROM node:14.21.3-bullseye

WORKDIR /app/be

COPY package*.json ./
RUN npm install
COPY . .
ENV TZ=Asia/Ho_Chi_Minh

EXPOSE 3001
CMD [ "node", "./bin/www" ]