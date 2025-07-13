import { Task } from 'task'
import chiri, { chiriwatch } from './chiri'
import serve from './serve'
import _static from './static'
import { tsWatch } from './ts'
import vendor from './vendor'
import weaving, { weavewatch } from './weaving'

export default Task('watch', async task => {
	await task.run(task.parallel(
		vendor,
		_static,
		chiri,
		weaving,
	))

	task.watch([
		'*.html',
		'.env',
		'src/node_modules/**/*.js',
		'static/**/*',
	], _static)

	await Promise.all([
		task.run(tsWatch),
		task.run(serve),
		task.run(chiriwatch),
		task.run(weavewatch),
	])
})
