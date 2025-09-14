import fs from 'fs/promises'
import { Task } from 'task'
import Env from './utility/Env'

export default Task('icons', async task => {
	await fs.mkdir('./icon/out', { recursive: true })
	await task.exec('NPM:fantasticon', '--normalize=true')
	const icons = await fs.readFile('./icon/out/icons.ts', 'utf8')
	await fs.mkdir('./src/style', { recursive: true })
	await fs.writeFile('./src/style/icons.ts', icons)

	if (Env.ENVIRONMENT === 'dev')
		await task.exec('NPM:eslint', './src/style/icons.ts', '--fix')
})
