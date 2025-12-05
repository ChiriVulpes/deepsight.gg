import fs from 'fs/promises'
import { Task } from 'task'

export default Task('install', async task => {
	await task.install(
		{
			path: '.',
			devDependencies: {
				task: { repo: 'chirivulpes/task', branch: 'package' },
				lint: { repo: 'fluff4me/lint' },
				chiri: { repo: 'fluff4me/chiri', branch: 'package' },
				weaving: { repo: 'chirivulpes/weaving', branch: 'package' },
			},
		},
		{
			path: 'src',
			dependencies: {
				'kitsui': { repo: 'fluff4me/kitsui', branch: 'package' },
				'conduit.deepsight.gg': { repo: 'chirivulpes/conduit.deepsight.gg', branch: 'package' },
				'deepsight.gg': { name: 'deepsight.gg' },
				'bungie-api-ts': { name: 'bungie-api-ts' },
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
