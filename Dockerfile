FROM node:20.11.1

WORKDIR /src

COPY package.json package-lock.json ./

RUN npm ci

COPY . . 

RUN npm run build 

EXPOSE 3000

CMD [ "npm", "start" ]