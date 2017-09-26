# Gulp Css Copy Assets

A gulp pipe plugin, to copy assets from source css code.

When we use gulp to build css, event scss to css, some images or other type of files are contained in this css code.
This plugin help you to copy these files to your wanted assets dir.
You do not need to care about the relative path in css.

**Notice:** only relative url is supported. For example `../img/a.jpg` is ok, `/img/1.jpg` and `http://domain/img/1.jpg` are not supported.

## Install

```
npm install --save-dev gulp-css-copy-assets
```

## Usage

```
import glup from 'gulp'
import copyAssets from 'gulp-css-copy-assets'

gulp.task('default', () => {
    glup.src('src/style.css')
        .pipe(copyAssets())
        .pipe(gulp.dest('dist'))
})
```

Files contained in `src/style.css` will be copy into `dist` directory. For example, in your css:

```
.test {
    background: url(../img/bg.jpg);
}
```

The `bg.jpg` is in `img` directory. You do not need to pass some options into `copyAssets`. It will find the image by relative path, and put it to `dist` directory. And the output content will be:

```
.test {
    background: url(xxxxxxxxxx.jpg); /* file name is hashed by md5-file */
}
```

**Notice**: the position in pipe lines make sense. For example, when you use sourcemap or rename:

```
glup.src('src/*.css')
    .pipe(sourcemap.init())
    .pipe(copyAssets())
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('dist'))
```

Then you will find a `.map` file of the image which is not your wanted. So you must put copyAssets after sourcemap.write action:

```
glup.src('src/*.css')
    .pipe(sourcemap.init())
    .... // some postcss action
    .pipe(sourcemap.write('.'))
    .pipe(copyAssets()) // do this after sourcemap.write
    .pipe(gulp.dest('dist'))
```

## Options

```
copyAssets({
    exts: ['.css', '.min.css'],
    srcdirs: [],
    resolve: '../assets',
    theme: 'blue'
})
```

**options.exts**

*Array*

The file extnames to check. Default is `.css`, but when you minify your css code, you should rewrite this option.

You should know the work principle of pipe stream. If you pass `src/*.css` into gup.src, every src css file will be a chunk in the stream. So the file may be renamed, copied or removed in pipe lines. `options.exts` is to find out the right files (which are in the list of output files), and find out images or other type of files contained in this css files, and rewrite the content in this css files.

```
gulp.src('**/*.css')
    .pipe(cssmin())
    .pipe(rename({
        suffix: '.min',
    }))
    .pipe(copyAssets({
        exts: ['.min.css'],
    }))
    .pipe('dist')
```

**options.srcdirs**

*Array*

The source style files' directories. `glob` is NOT supported.
However, you can use glob to find out directories first, and then pass them to options.srcdirs.

Some times, you may have different paths of css files passed into pipe stream. e.g. `gulp.src('style/**/*.scss')`, which mean images' paths are not relative to source file because of `import`.

```
@import '../scss/settings'

.test{}
```

Images may be contained in `../scss/_settings.scss`, but after you do sass converting, the relative path have been changed. e.g.

```
glup.src('src/style.scss')
    .pipe(sass())
    .pipe(copyAssets()) // images in _settings.scss will not be found.
    .pipe(gulp.dest('dist'))
```

So you can pass options.srcdirs:

```
glup.src('src/style.scss')
    .pipe(sass())
    .pipe(copyAssets({
        srcdirs: [__dirname + '/../scss']
    }))
    .pipe(gulp.dest('dist'))
```

Notice: directories paths in `options.srcdirs` are style files directories, not assets source directories. Assets source paths are found by gulp-css-copy-assets automaticly.

The upper code will help you to find out true images path. The directory in `gulp.src` is not needed.

**options.resolve**

*String*

The output directory of assets, relative to dest directory. For example, your dest directory is 'dist', if you pass options.resolve '../assets', output css will be put in 'dist', and output assets will be in 'assets'. 'dist' and 'assets' are the same level in directory tree.

**options.theme**

*String*

A theme directory which should be considered while looking up for assets. I.e. when referencing an image as `url(../img/image.png)` then it will be looked for a subdirectory with a theme-name which probably contains the image. If theme name is `'blue'`, then the image will also be searched in `url(../img/blue/image.png)`.

## Development

If you want to modify code, just run `npm run build` after your change.