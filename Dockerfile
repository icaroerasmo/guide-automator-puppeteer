FROM node:12.15.0-buster

RUN apt update
RUN apt install -y festival ffmpeg xvfb libfontconfig wkhtmltopdf
RUN apt install -y chromium
RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser

WORKDIR /usr/src/app
COPY . .

RUN npm install

ENTRYPOINT ["node", "main.js"]
