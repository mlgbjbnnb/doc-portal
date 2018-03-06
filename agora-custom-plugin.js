//Derek: 这个插件只是找个地方写类似于gulp task的脚本

const fs = require('fs');
const cp = require('child_process');

function AgoraCustomPlugin(){

}

try {
    var lang = fs.readFileSync('../doc_source/LANG.txt', 'utf8').trim();
}catch(e){
    console.error('CANNOT read doc_source/LANG.txt');
    process.exit();
}

try {
    var version = fs.readFileSync('../doc_source/VERSION.txt', 'utf8').trim();
}catch(e){
    console.error('CANNOT read doc_source/VERSION.txt');
    process.exit();
}

AgoraCustomPlugin.prototype.apply = function(compiler){
    compiler.plugin('run', function(compiler, callback) {
        checkVersionList(callback);
    });
};

function checkVersionList(callback){
    const pathVersionList = '../build/html/' + lang + '/config.json';
    try {
        var versionListFile = fs.readFileSync(pathVersionList, 'utf8');
    }catch(e) {
        console.log('Failed to read versionListFile. Trying to write one');
        var versionList = {
            "lang": lang,
            "defaultVersion": version,
            "versions": [
                version
            ]
        };

        try {
            fs.writeFileSync(pathVersionList, JSON.stringify(versionList, null, 4));
            var versionListFile = fs.readFileSync(pathVersionList, 'utf8');
        }catch(e){
            console.error("Failed to write versionListFile");
            process.exit();
        }
    }
    try{
        var versionList = JSON.parse(versionListFile);
    }catch(e){
        console.error('Error Parsing ' + pathVersionList,e);
        return callback(e);
    }

    if (versionList.versions.indexOf(version) == -1){
        var err = "[ERROR] Please Add " + version + " to " + lang + " Version List " + pathVersionList;
        console.error(err);
        return callback(err);
    }
}

module.exports = AgoraCustomPlugin;