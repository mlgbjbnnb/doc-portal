#!/bin/sh
Version=$(cat ../doc_source/VERSION.txt)
Lang=$(cat ../doc_source/LANG.txt)
deployDir=/data/dev_portal
#CDNPath=docs.agora.io
ServerName=${@:$OPTIND:1}
Rev="$(cd .. && git rev-parse HEAD)"
VerInfo="$(cd .. && git log --pretty=format:"\n%h - %an, %ar : %s" -n2)"
CDNPath=document.agora.io

if [ -z $ServerName ]; then
    echo "[ERROR] - server name not given, example:"
    echo ">> ./deploy devportal"
    exit 1
fi

if [ -z $Version ]; then
    echo "[ERROR] - Version name not given"
    exit 1
fi

if [ -z $Lang ]; then
    echo "[ERROR] - Lang name not given"
    exit 1
fi

for d in "./build/html/$Lang/$Version"

do
    if [ ! -d $d ]; then
        echo "[ERROR] - $d not found, please run 'make html' before deploy"
        # exit 1
    fi
done

echo "Make sure version correct:(last 2 commits)"
echo "--------------------------------------------------------------------------"
echo "$VerInfo"
echo "SDK VERSION: $Version"
echo "--------------------------------------------------------------------------"


echo "[INFO] - [$ServerName]  deploying document ver:[$Version] ....."
ssh $ServerName  "mkdir -p $deployDir/$Lang/$Version"
cd ../build/html
rsync -v -z -r --delete --progress -h --exclude=.* ./$Lang/$Version $ServerName:$deployDir/$Lang

echo "Refresh CDN: $CDNPath/$Lang/$Version/"
aliyuncli cdn RefreshObjectCaches --ObjectPath $CDNPath/$Lang/$Version/ --ObjectType Directory
aliyuncli cdn RefreshObjectCaches --ObjectPath $CDNPath/$Lang/$Version/figure/ --ObjectType Directory

echo "Refresh Request Sent. DescribeRefreshTasks:"
Result=`aliyuncli cdn DescribeRefreshTasks --PageSize 1`
while ((`echo "$Result" | grep -c Refreshing` > 0))
do
  echo "$Result" | grep Process | sed s/[[:space:]]//g
  sleep 2s
  Result=`aliyuncli cdn DescribeRefreshTasks --PageSize 1`
done

ssh $ServerName  "cd $deployDir/$Lang/$Version ; echo \"$Rev\">__rev;"
echo "[INFO] - [$ServerName]  Successfully deployed $Lang document ver:[$Version]"

