const xvideos = require('@rodrigogs/xvideos');
const https = require('https');
var fs = require('fs');
var moment = require('moment');

const browserHistoryFile = 'D:/Desktop/BrowserHistory.json';
const resultFile = 'D:/Desktop/result.json';
const savePath = __dirname + "/video/";

async function main(){
    const detail = await xvideos.videos.details({url: 'https://www.xvideos.com/video46155127/10519521/0/sm_erin_anal_machine'});
    console.log(detail);
}


async function BrowserHistory(){
    const regexp = new RegExp('https://www.xvideos.com/video.*?');
    let str = fs.readFileSync(browserHistoryFile);
    let json = JSON.parse(str);
    let result = [];

    for (let v of json["Browser History"]){
        if (regexp.test(v.url)) {
            result.push(v)
        }
    }


    fs.writeFileSync(resultFile, JSON.stringify(result));

    console.log("count: " + result.length);
}

// BrowserHistory();
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {

        var file = fs.createWriteStream(dest);
        https.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
                resolve();
            });
        });

    });
}
function fileNameHandle(title) {
    return title.replace(/\s+/g,"-").replace(/_+/g,"-").replace(/-+/g,"-").replace(/xvideos\.com/ig,"").replace(/-$/g,"").replace(/[;&,!@~#*]/g,"");
}

async function download() {
    let str = fs.readFileSync(resultFile);
    let histories = JSON.parse(str);
    let i = 0;
    for (let history of histories){
        i++;
        let time = moment(parseInt(history.time_usec/1000));
        let path, detail, dir, videoUrl, pageUrl = history.url;

        console.log(`${i}/${histories.length}开始解析: ${pageUrl}`);

        try{
            detail = await xvideos.videos.details({url: pageUrl});
            videoUrl = detail.files.high;
            dir = savePath + time.format("YYYY-MM") + "/";
            fs.existsSync(dir) || fs.mkdirSync(dir);
            path = dir + fileNameHandle(detail.title)+ ".mp4";
        }catch (e) {
            console.log(`解析网址和文件链接错误: url: ${pageUrl} (${e.message})`);
            continue;
        }

        try{
            if (fs.existsSync(path)) {
                console.log('文件已存在，跳过下载:' + videoUrl)
            }else{
                console.log('开始下载文件:' + videoUrl);
                await downloadFile(videoUrl, path);
            }
        }catch (e) {
            console.log(`下载保存文件错误: url: ${videoUrl} path: ${path} (${e.message})`);
            try{fs.existsSync(path) && fs.unlinkSync(path);}catch (e) {}
            continue;
        }

        console.log('成功:' + path)
    }
}
download();
