import { Task, TypeScript } from 'task'
import Env from './utility/Env'

const options = Env.ENVIRONMENT === 'dev'
	? ['--inlineSourceMap', '--inlineSources', '--incremental']
	: ['--pretty']

const ts = Task('ts', task => task.series(
	Task('ts', () => TypeScript.compile(task, 'src', '--pretty', ...options)),
	// copyClientToPlatform,
))

export default ts

export const tsWatch = Task('ts (watch)', task => task.series(
	ts,
	task.parallel(
		() => TypeScript.compile(task, 'src', '--watch', '--preserveWatchOutput', '--pretty', ...options),
		// () => task.watch('out/client/index.js', copyClientToPlatform),
	),
))

// function copyClientToPlatform () {
// 	return fs.copyFile('out/client/index.js', 'out/service/client.js').catch(() => { })
// }
