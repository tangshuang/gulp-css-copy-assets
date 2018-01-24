import fs from 'fs'
import path from 'path'
import md5file from 'md5-file'
import GulpBufferify from 'gulp-bufferify'

function matchAll(str, reg) {
    var res = []
    var match
    while(match = reg.exec(str)) {
        res.push(match)
    }
    return res
}

function isEndAs(str, endStr) {
    var pos = str.length - endStr.length
    return (pos >= 0 && str.lastIndexOf(endStr) == pos)
}

export default function(options = {}) {
    return GulpBufferify((content, file, context) => {
        let exts = ['.css']
        let isEx = false

        if(Array.isArray(options.exts)) exts = exts.concat(options.exts)
        for(let ext of exts) {
            if(isEndAs(file.path, ext)) {
                isEx = true
                break
            }
        }

        if(!isEx) return content

        let matches = matchAll(content, /url\((\S+?)\)/gi)
        if(matches instanceof Array) {
            matches.forEach(match => {
                let url = match[1].toString()
                // only relative path supported, absolute path will be ignore
                if(url.substr(0, 1) === '/' || url.indexOf('http') === 0 || url.indexOf('data:') === 0) {
                    return
                }
                // clear ' or  '
                var fileurl = url.replace(/\"/g, '').replace(/\'/g, '')
                // cut off at ?
                var qry = fileurl.indexOf('?')
                var qrystring = ''
                if(qry !== -1) {
                    qrystring = fileurl.substring(qry)
                    fileurl = fileurl.substring(0, qry)
                }
                // cut off at #
                var qryh = fileurl.indexOf('#')
                if(qryh !== -1) {
                    qrystring = fileurl.substring(qryh)
                    fileurl = fileurl.substring(0, qryh)
                }

                // if there is no such file, ignore
                let srcdirs = [path.dirname(file.path)]
                if(options && Array.isArray(options.srcdirs)) {
                    srcdirs = [...srcdirs, ...options.srcdirs]
                }

                let filetruepath

                for(let dir of srcdirs) {
                    let truepath = path.resolve(dir, fileurl)
                    if (fs.existsSync(truepath)) {
                        filetruepath = truepath
                        break
                    } 
                    else if (options.theme) {
                        truepath = truepath.replace(/\\/g, '/')
                            .replace(/(.*)\/([^/]+)$/, (s, m1, m2) => {
                                return m1 + '/' + options.theme + '/' + m2
                            })
                        if (fs.existsSync(truepath)) {
                            filetruepath = truepath
                            break
                        }
                    }
                }

                if(!filetruepath) {
                    console.log(fileurl + ' not found')
                    return
                }

                // process
                let filehash = md5file.sync(filetruepath).substr(8, 16)
                let filename = filehash + path.extname(filetruepath)
                let filecontent = fs.readFileSync(filetruepath)

                let newfile = file.clone()
                newfile.contents = new Buffer(filecontent)
                newfile.path = path.resolve(path.dirname(file.path), options && options.resolve ? options.resolve : '', filename)

                context.push(newfile)

                content = content.split(url).join((options && options.resolve ? options.resolve + '/' : '') + filename + qrystring)
            })
            return content
        }
    })
}
