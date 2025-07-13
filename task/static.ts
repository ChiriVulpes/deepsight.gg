import fs from 'fs/promises'
import { Task } from 'task'

export default Task('static', async task => {
	await fs.mkdir('out', { recursive: true })
	await fs.copyFile('index.html', 'out/index.html')
	await fs.copyFile('.env', 'out/.env')
	await fs.copyFile('src/node_modules/kitsui/index.js', 'out/kitsui.js')
	await fs.copyFile('src/node_modules/conduit.deepsight.gg/index.js', 'out/conduit.deepsight.gg.js')
	await fs.rm('out/static', { recursive: true, force: true })
	await fs.cp('static', 'out/static', { recursive: true, force: true })
})
