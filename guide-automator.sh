GUIDE_AUTOMATOR_LIBS=./resources/libs/
export PATH=$GUIDE_AUTOMATOR_LIBS/wkhtmltox/bin:$PATH

if [ ! -e "./node_modules" ]; then
    echo 'Installing dependencies...'
    $GUIDE_AUTOMATOR_LIBS/node/v12.15.0/bin/npm i  > /dev/null 2>&1
fi

$GUIDE_AUTOMATOR_LIBS/node/v12.15.0/bin/node main $@
