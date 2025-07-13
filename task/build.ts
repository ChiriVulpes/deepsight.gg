import { Task } from 'task'
import chiri from './chiri'
import _static from './static'
import ts from './ts'
import vendor from './vendor'
import weaving from './weaving'

export default Task('build', task => task.parallel(
	_static,
	task.series(
		task.parallel(
			chiri,
			weaving,
			vendor,
		),
		ts,
	)
))
