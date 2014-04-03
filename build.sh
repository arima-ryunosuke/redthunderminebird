#!/bin/sh

set -e

CURRENT=$(readlink -f $(dirname $0))
TEMP=$CURRENT/temp

mkdir $TEMP

cp -r $CURRENT/content $TEMP/content
cp -r $CURRENT/defaults $TEMP/defaults
cp -r $CURRENT/locale $TEMP/locale
cp -r $CURRENT/modules $TEMP/modules
cp -r $CURRENT/chrome.manifest $TEMP/chrome.manifest
cp -r $CURRENT/install.rdf $TEMP/install.rdf

sed -i -e "s%var DEBUG = .+;%var DEBUG = false;%g" $TEMP/modules/common.js
sed -i -e "s%var LOGLEVEL = .+;%var LOGLEVEL = 2;%g" $TEMP/modules/common.js

cd $TEMP
zip -r $CURRENT/redthunderminebird.xpi ./

rm -rf $TEMP
