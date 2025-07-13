import fs from 'fs/promises'
import { Dependencies, Task } from 'task'

export default Task('vendor', async () => {
	const amdHeader = await Dependencies.get('amd')
	await fs.mkdir('src/bundle', { recursive: true })
	await fs.writeFile('src/bundle/amd.js', amdHeader)
})
