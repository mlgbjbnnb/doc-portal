#!/bin/sh
LANG=$(cat ../doc_source/LANG.txt)

cp -r ./assets ../build/html/
cp ./index.html ../build/html/${LANG}/

echo 'Deployed to build folder!'
