var packageJson = require('./package.json')
var deps = Object.keys(packageJson.dependencies)
var externals = {}
if(deps.length > 0) deps.forEach(dep => externals[dep] = dep)

module.exports = {
	name: 'gulp-css-copy-assets',
	type: 'npm',
	build: [
		{
			from: 'src/gulp-css-copy-assets.js',
			to: 'dist/gulp-css-copy-assets.js',
			driver: 'webpack',
			options: {
				minify: false,
				sourcemap: false,
			},
			settings: {
				output: {
					library: 'gulp-css-copy-assets',
					libraryTarget: 'commonjs2',
				},
				target: 'node',
				node: {
					global: false,
					Buffer: false,
				},
				externals: externals,
			},
		}
	],
	test: {
		entry: 'test/gulp-css-copy-assets.js',
		browsers: 'Terminal',
	},
}
