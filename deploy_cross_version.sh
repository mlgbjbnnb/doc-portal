#!/bin/sh
deployDir=/data/dev_portal
#CDNPath=docs.agora.io
ServerName=${@:$OPTIND:1}
Rev="$(cd .. && git rev-parse HEAD)"
Lang="$(cat ../doc_source/LANG.txt)"
CDNPath=document.agora.io

if [ -z $ServerName ]; then
    echo "[ERROR] - server name not given, example:"
    echo ">> ./deploy portal-production"
    exit 1
fi

if [ -z $Lang ]; then
    echo "[ERROR] - Lang name not given"
    exit 1
fi


cd ../build/html

rsync -v -z -r --delete --progress -h --exclude=.* assets $ServerName:$deployDir/

rsync -v -z -r --delete --progress -h --exclude=.* $Lang/index.html $ServerName:$deployDir/$Lang

rsync -v -z -r --delete --progress -h --exclude=.* $Lang/config.json $ServerName:$deployDir/$Lang

echo "Refresh CDN: $CDNPath"
aliyuncli cdn RefreshObjectCaches --ObjectPath $CDNPath/ --ObjectType Directory
aliyuncli cdn RefreshObjectCaches --ObjectPath $CDNPath/assets/ --ObjectType Directory
aliyuncli cdn RefreshObjectCaches --ObjectPath $CDNPath/$Lang/ --ObjectType Directory

echo "Refresh Request Sent. DescribeRefreshTasks:"
Result=`aliyuncli cdn DescribeRefreshTasks --PageSize 1`
while ((`echo "$Result" | grep -c Refreshing` > 0))
do
  echo "$Result" | grep Process | sed s/[[:space:]]//g
  sleep 2s
  Result=`aliyuncli cdn DescribeRefreshTasks --PageSize 1`
done

echo "[INFO] - [$ServerName]  Successfully deployed $Lang document cross version"

