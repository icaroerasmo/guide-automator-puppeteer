if [ ! -e "./node_modules" ]; then
    echo 'Installing dependencies...'
    npm i  > /dev/null 2>&1
fi

node main $@
