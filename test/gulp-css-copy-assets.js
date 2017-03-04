import GulpCssCopyAssets from '../dist/gulp-css-copy-assets'
import gulp from 'gulp'
import fs from 'fs'
import path from 'path'
import md5file from 'md5-file'

describe('Gulp Css Copy Assets Unit Test', () => {
    it('copy assets from from dir to to dir', (done) => {
        gulp.src(__dirname + '/from/style.css')
            .pipe(GulpCssCopyAssets())
            .pipe(gulp.dest(__dirname + '/to'))
            .on('end', () => {
                fs.readdirSync(__dirname + '/to').forEach(item => {
                    if(path.extname(item) === '.png') {
                        let md5to = md5file.sync(__dirname + '/to/' + item)
                        let md5from = md5file.sync(__dirname + '/from/gulp.png')
                        expect(md5to).toBe(md5from)
                        done()
                    }
                })
            })
    })
})
