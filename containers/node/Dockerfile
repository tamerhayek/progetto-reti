FROM node:latest
WORKDIR /app
COPY . .
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm","start"]
