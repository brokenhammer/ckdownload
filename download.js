const request = require('request')
const fs = require('fs')
const Bagpipe = require('bagpipe')
const url = require('url')
const path = require('path')
const process = require('child_process')
const readlineSync = require('readline-sync')

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (prefix) {
        return this.slice(0, prefix.length) === prefix;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}


function cmd_download(m3u_src, dest_dir, start_file){
    process.exec('mkdir -p ' + dest_dir ,function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error)
        }else{
            console.log('Begin download...')
            console.log('m3u8 src ' + m3u_src)
            console.log('start from' + start_file)
            download(m3u_src, dest_dir, start_file)

        }
    });
    // dry_run(url, start, end)
}

var downloadVideo = function (src, dest, callback) {
        var req = request({"url":src, "rejectUnauthorized": false}, function(error, res, body){
            if(error){
                console.log('err when downloading' + src + '!')
                fs.writeFile('download_err.txt', src+'\n', {'flag':'a'}, function(err){
                    if(err){console.error(err)}
                })
                return '-0-'
            }
        })
        var stream = fs.createWriteStream(dest)
        req.pipe(stream).on('close', function () {
            callback("completed " + src)
        })
}

var parseM3u = function(data) {
    var rtn = []
    var lines = data.split('\n')
    for (i in lines) {
        if (lines[i].endsWith('.ts')) {
            rtn.push(lines[i])
        }
    }
    return rtn
}

function download(m3u_src, dest_dir, start_file) {
    var prefix = url.resolve(m3u_src,".")
    request({ "url": m3u_src, "rejectUnauthorized": false }, (err, res, body) => {
        //console.log(body)
        var list_of_files = parseM3u(body)
        if (start_file.length>0){
            var start_index = list_of_files.indexOf(start_file)
            console.log("origin length:" + list_of_files.length)
            var new_list = list_of_files.slice(start_index)
            console.log("new length:" + new_list.length)
            list_of_files = new_list
            }
        m3u_dest = path.join(dest_dir, path.basename(m3u_src))
        url_dest = path.join(dest_dir, 'url.txt')
        fs.writeFileSync(url_dest, m3u_src, (err) => {
            if(err) {
                alert('写入网址失败!')
                return
            }
        })
        fs.writeFileSync(m3u_dest, body, (err) => {
            if(err) {alert('写入m3u8文件失败!');
                return
            }
        })
        downloadAll(list_of_files, prefix, dest_dir)
    })
}

let bp = new Bagpipe(11, { refuse: false })
function downloadAll(list_of_files, prefix, dest_dir) {
    for (var i in list_of_files) {
        var src = url.resolve(prefix, list_of_files[i])
        var dest = path.join(dest_dir, list_of_files[i])
        bp.push(downloadVideo, src, dest, function (data) {
            console.log(data)
        });
    }
}
function sleep(ms) {
    return new Promise(resolve => 
        setTimeout(resolve, ms)
    )
  }

function print(src, dest, callback) {
    sleep(Math.floor(Math.random()*1000)+1).then(() => {
        callback(src)
    })
}

var m3u_src_input = readlineSync.question('Input m3u8 src:')
var dest_dir_input = readlineSync.question('Input the destination directory:')
var start_file = readlineSync.question('start from:')

cmd_download(m3u_src_input, dest_dir_input, start_file)
