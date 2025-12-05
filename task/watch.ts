import { Task } from 'task'
import chiri, { chiriwatch } from './chiri'
import icons from './icons'
import serve from './serve'
import _static from './static'
import { tsWatch } from './ts'
import vendor from './vendor'
import weaving, { weavewatch } from './weaving'

export default Task('watch', async task => {
	await task.run(task.parallel(
		task.series(
			icons,
			_static,
		),
		vendor,
		chiri,
		weaving,
	))

	task.watch([
		'*.html',
		'.env',
		'src/node_modules/**/*.js',
		'static/**/*',
		'icon/out/**/*.ttf',
		'icon/out/**/*.woff',
		'icon/out/**/*.woff2',
	], _static)

	task.watch('icon/**/*.svg', icons)

	await Promise.all([
		task.run(tsWatch),
		task.run(serve),
		task.run(chiriwatch),
		task.run(weavewatch),
	])
})
