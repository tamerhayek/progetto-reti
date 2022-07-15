FROM node:latest
WORKDIR /nodemailer
COPY . .
RUN npm install --omit=dev
EXPOSE 5672
CMD ["node", "server.js"]