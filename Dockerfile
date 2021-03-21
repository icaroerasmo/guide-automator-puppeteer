FROM node:12.15.0-buster

WORKDIR /usr/src/app

RUN sed -i 's/deb http:\/\/deb.debian.org\/debian buster main/deb http:\/\/deb.debian.org\/debian buster main contrib non-free/g' /etc/apt/sources.list

RUN cat /etc/apt/sources.list

RUN apt update
RUN apt upgrade -y
RUN apt install -y \
    espeak \
    mbrola-br* \
    ffmpeg \
    xfonts-75dpi \
    xfonts-base \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

RUN export WKHTML_LATEST_VERSION=$(\
    wget -O - "https://api.github.com/repos/wkhtmltopdf/wkhtmltopdf/releases/latest" | \
    grep '"tag_name":' | \
    sed -E 's/.*"([^"]+)".*/\1/') && \
    wget "https://github.com/wkhtmltopdf/packaging/releases/download/${WKHTML_LATEST_VERSION}-1/wkhtmltox_${WKHTML_LATEST_VERSION}-1.buster_amd64.deb" \
    && dpkg -i wkhtmltox_${WKHTML_LATEST_VERSION}-1.buster_amd64.deb \
    && rm wkhtmltox_${WKHTML_LATEST_VERSION}-1.buster_amd64.deb

COPY . .

RUN npm install

ENTRYPOINT ["node", "main.js"]