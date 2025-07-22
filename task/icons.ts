import fs from 'fs/promises'
import { Task } from 'task'

export default Task('icons', async task => {
	await fs.mkdir('./icon/out', { recursive: true })
	await task.exec('NPM:fantasticon')
	const icons = await fs.readFile('./icon/out/icons.ts', 'utf8')
	await fs.writeFile('./src/style/icons.ts', icons)
	await task.exec('NPM:eslint', './src/style/icons.ts', '--fix')
})
