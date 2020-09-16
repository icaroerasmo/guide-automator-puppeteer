#!/usr/bin/env bash

FULL_PATH_SCRIPT=$(readlink -f "$0")
CONTAINING_FOLDER=$(dirname "$FULL_PATH_SCRIPT")
GUIDE_AUTOMATOR_LIBS=$CONTAINING_FOLDER/resources/libs
PATH=$GUIDE_AUTOMATOR_LIBS/node/v12.15.0/bin:$PATH
PATH=$GUIDE_AUTOMATOR_LIBS/wkhtmltox/bin:$PATH
PATH=$GUIDE_AUTOMATOR_LIBS/ffmpeg:$PATH

export PATH

if ! [ -x "$(command -v git)" ]; then
  echo 'Error: git is not installed.' >&2
  exit 1
fi

if [ ! -e "./node_modules" ]; then
    echo 'Installing dependencies...'
    npm i  > /dev/null 2>&1
fi

$CONTAINING_FOLDER/main.js $@
