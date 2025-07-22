import fs from 'fs/promises'
import { Task } from 'task'

export default Task('install', async task => {
	await task.install(
		{
			path: '.',
			dependencies: {
				task: { path: 'chirivulpes/task', branch: 'package' },
				lint: { path: 'fluff4me/lint' },
				chiri: { path: 'fluff4me/chiri', branch: 'package' },
				weaving: { path: 'chirivulpes/weaving', branch: 'package' },
			},
		},
		{
			path: 'src',
			dependencies: {
				'kitsui': { path: 'fluff4me/kitsui', branch: 'package' },
				'conduit.deepsight.gg': { path: 'chirivulpes/conduit.deepsight.gg', branch: 'package' },
			},
		},
	)

	// monkeypatch fantasticon to use tinyglobby instead of glob so it actually finds files
	let assetsjs = await fs.readFile('node_modules/fantasticon/lib/utils/assets.js', 'utf8')
	assetsjs = assetsjs
		.replace('require("glob")', 'require("tinyglobby")')
		.replace('globPath, {}', 'globPath.replaceAll("\\\\", "/"), {}')
	await fs.writeFile('node_modules/fantasticon/lib/utils/assets.js', assetsjs)
})
