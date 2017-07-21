/**
 * 引入 gulp及组件
 * npm install --save-dev gulp gulp-if gulp-ruby-sass gulp-clean-css gulp-autoprefixer gulp-requirejs-optimize gulp-minify-html fs-extra minimist run-sequence q isutf8 gulp-babel babel-preset-es2015 del gulp-uglify
 */

const gulp = require('gulp') //基础库
const gulpif = require('gulp-if') //条件执行
const sass = require('gulp-ruby-sass') //css预编译
const cleanCSS = require('gulp-clean-css') //css压缩
const autoprefixer = require('gulp-autoprefixer') //自动前缀
const requirejsOptimize = require('gulp-requirejs-optimize') //requirejs打包
const minifyHtml = require("gulp-minify-html") //html压缩
const Q = require('q')
const fs = require('fs-extra')
const isutf8 = require('isutf8')
const del = require('del')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')

const minimist = require('minimist') //命令行参数解析
const runSequence = require('run-sequence') //顺序执行
const path = require('path') //路径
const child_process = require('child_process') //子进程
const os = require('os') //操作系统相关

var args = minimist(process.argv.slice(2)) //命令行参数

const SRC = './src/'
const DIST = './dist/'
const TEMP = '.temp/'

const ASSETS_SRC = SRC + 'assets/'
const ASSETS_DIST = DIST + 'assets/'

gulp.task('clean-css', _ => {
	return del(ASSETS_DIST + 'css')
})

gulp.task('clean-js', _ => {
	return del(ASSETS_DIST + 'js')
})

gulp.task('clean-font', _ => {
	return del(ASSETS_DIST + 'font')
})

gulp.task('clean-image', _ => {
	return del(ASSETS_DIST + 'image')
})

gulp.task('clean-html', _ => {
	return del([
		DIST + 'index.html',
		DIST + 'favicon.ico',
	])
})

gulp.task('clean-dist', _ => {
	return del(DIST)
})

gulp.task('clean-scratch2', _ => {
	return del(DIST + 'scratch2')
})

gulp.task('clean-scratch3', _ => {
	return del(DIST + 'scratch3')
})

gulp.task('pack-css', ['clean-css'], _ => {
	return sass(ASSETS_SRC + 'css/*.scss', {style: "expanded"})
		.pipe(autoprefixer())
		.pipe(gulpif(args.release, cleanCSS()))
		.pipe(gulp.dest(ASSETS_DIST + 'css/'))
})

gulp.task('clean-temp-js', _ => {
	return del(TEMP + 'js')
})

gulp.task('transform-js', ['clean-temp-js'], callback => {
	if(!args.force && !args.release) {
		callback()
		return
	}

	return gulp.src([ASSETS_SRC + 'js/**/*.js', '!' + ASSETS_SRC + 'js/require.js', '!' + ASSETS_SRC + 'js/es6-shim.js', '!' + ASSETS_SRC + 'js/vendor/**/*'])
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest(TEMP + 'js'))
})

gulp.task('copy-vendor-js', ['clean-temp-js'], callback => {
	if(!args.force && !args.release) {
		callback()
		return
	}

	return gulp.src([ASSETS_SRC + 'js/vendor/**/*'])
		.pipe(gulp.dest(TEMP + 'js/vendor/'))
})

gulp.task('pack-js', ['clean-js', 'transform-js', 'copy-vendor-js'], _ => {
	if(args.release) {
		gulp.src([ASSETS_SRC + 'js/require.js', ASSETS_SRC + 'js/es6-shim.js'])
			.pipe(gulp.dest(ASSETS_DIST + 'js/'))
	
		return gulp.src(TEMP + 'js/*.js')
			.pipe(requirejsOptimize({
				useStrict: true,
				optimize: "uglify",
			}))
			.pipe(gulp.dest(ASSETS_DIST + 'js/'))
	} else {
		return gulp.src(ASSETS_SRC + 'js/**/*.js')
			.pipe(gulp.dest(ASSETS_DIST + 'js/'))
	}
})

gulp.task('pack-image', ['clean-image'], _ => {
	return gulp.src(ASSETS_SRC + 'image/**/*')
		.pipe(gulp.dest(ASSETS_DIST + 'image/'))
})

gulp.task('pack-font', ['clean-font'], _ => {
	return gulp.src(ASSETS_SRC + 'font/**/*')
		.pipe(gulp.dest(ASSETS_DIST + 'font/'))
})

gulp.task('pack-html', ['clean-html'], _ => {
	return gulp.src([
			'./src/index.html',
			'./src/favicon.ico',
		])
		.pipe(gulp.dest(DIST))
})

gulp.task('pack-scratch2', ['clean-scratch2'], _ => {
	return gulp.src("../scratch-flash/build/**/*")
		.pipe(gulp.dest(DIST + "scratch2"))
})

gulp.task('pack-scratch3', ['clean-scratch3'], _ => {
	return gulp.src(["../scratch-gui/build/**/*", "!../scratch-gui/build/**/*.js.map"])
		.pipe(gulp.dest(DIST + "scratch3"))
})

gulp.task('pack-replace', callback => {
	if(args.with) {
		var name = args.with
		var indexPath = DIST + "index.html"
		var content = fs.readFileSync(indexPath, "utf8")
		var reg = /data-iframe-src=".*"/g
		fs.writeFileSync(indexPath, content.replace(reg, `data-iframe-src="${name}/index.html"`))
	}
	callback()
})

gulp.task('pack', ['pack-html', 'pack-image', 'pack-font', 'pack-js', 'pack-css'])

// 默认任务
gulp.task('default', ['pack'], _ => {
	if(args.with) {
		var tasks = [`pack-${args.with}`, 'pack-replace']
		args.publish && tasks.push("publish")
		return runSequence.apply(this, tasks)
	}
})

gulp.task('publish', _ => {
	var name = args.with
	return gulp.src(DIST + "**/*")
		.pipe(gulp.dest(`./release/${name}/`))
})