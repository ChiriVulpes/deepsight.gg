import { Task } from 'task'

const params = ['index.quilt', '--out', '../../out/lang', '--outTypes', '../../src/lang', '--outWhitespace']
export default Task('weave', async task => {
	await task.exec(
		{
			cwd: 'lang/en-nz',
		},
		'NPM:weaving', ...params)
})

export const weavewatch = Task('weavewatch', task =>
	task.exec(
		{
			env: {
			},
			cwd: 'lang/en-nz',
		},
		'NPM:weaving', ...params, '--watch')
)
