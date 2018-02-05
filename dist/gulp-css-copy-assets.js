'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return (0, _gulpBufferify2.default)(function (content, file, context) {
        var exts = ['.css'];
        var isEx = false;

        if (Array.isArray(options.exts)) exts = exts.concat(options.exts);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = exts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var ext = _step.value;

                if (isEndAs(file.path, ext)) {
                    isEx = true;
                    break;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (!isEx) return content;

        var matches = matchAll(content, /url\((\S+?)\)/gi);
        if (matches instanceof Array) {
            matches.forEach(function (match) {
                var url = match[1].toString();
                // only relative path supported, absolute path will be ignore
                if (url.substr(0, 1) === '/' || url.indexOf('http') === 0 || url.indexOf('data:') === 0) {
                    return;
                }
                // clear ' or  '
                var fileurl = url.replace(/\"/g, '').replace(/\'/g, '');
                // cut off at ?
                var qry = fileurl.indexOf('?');
                var qrystring = '';
                if (qry !== -1) {
                    qrystring = fileurl.substring(qry);
                    fileurl = fileurl.substring(0, qry);
                }
                // cut off at #
                var qryh = fileurl.indexOf('#');
                if (qryh !== -1) {
                    qrystring = fileurl.substring(qryh);
                    fileurl = fileurl.substring(0, qryh);
                }

                // if there is no such file, ignore
                var srcdirs = [_path2.default.dirname(file.path)];
                if (options && Array.isArray(options.srcdirs)) {
                    srcdirs = [].concat(_toConsumableArray(srcdirs), _toConsumableArray(options.srcdirs));
                }

                var filetruepath = void 0;

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = srcdirs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dir = _step2.value;

                        var truepath = _path2.default.resolve(dir, fileurl);
                        if (_fs2.default.existsSync(truepath)) {
                            filetruepath = truepath;
                            break;
                        } else if (options.theme) {
                            truepath = truepath.replace(/\\/g, '/').replace(/(.*)\/([^/]+)$/, function (s, m1, m2) {
                                return m1 + '/' + options.theme + '/' + m2;
                            });
                            if (_fs2.default.existsSync(truepath)) {
                                filetruepath = truepath;
                                break;
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                if (!filetruepath) {
                    console.log(fileurl + ' not found');
                    return;
                }

                // process
                var filehash = _md5File2.default.sync(filetruepath).substr(8, 16);
                var filename = filehash + _path2.default.extname(filetruepath);
                var filecontent = _fs2.default.readFileSync(filetruepath);

                var newfile = file.clone();
                newfile.contents = new Buffer(filecontent);
                newfile.path = _path2.default.resolve(_path2.default.dirname(file.path), options && options.resolve ? options.resolve : '', filename);

                context.push(newfile);

                content = content.split(url).join((options && options.resolve ? options.resolve + '/' : '') + filename + qrystring);
            });
            return content;
        }
    });
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _md5File = require('md5-file');

var _md5File2 = _interopRequireDefault(_md5File);

var _gulpBufferify = require('gulp-bufferify');

var _gulpBufferify2 = _interopRequireDefault(_gulpBufferify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function matchAll(str, reg) {
    var res = [];
    var match;
    while (match = reg.exec(str)) {
        res.push(match);
    }
    return res;
}

function isEndAs(str, endStr) {
    var pos = str.length - endStr.length;
    return pos >= 0 && str.lastIndexOf(endStr) == pos;
}
