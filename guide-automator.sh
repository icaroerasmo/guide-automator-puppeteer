export GUIDE_AUTOMATOR_LIBS=$(pwd)/resources/libs
export PATH=$GUIDE_AUTOMATOR_LIBS/git:$GUIDE_AUTOMATOR_LIBS/node/v12.15.0/bin:$GUIDE_AUTOMATOR_LIBS/wkhtmltox/bin:$PATH

if [ ! -e "./node_modules" ]; then
    echo 'Installing dependencies...'
    npm i  > /dev/null 2>&1
fi

node main $@
