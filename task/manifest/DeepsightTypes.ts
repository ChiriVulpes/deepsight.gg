import fs from 'fs-extra'
import { Task } from 'task'

export default Task('DeepsightTypes', async () => {
	await emit('DeepsightPlugCategorisation')
	await emit('DeepsightBreakerTypeDefinition')
})

async function emit (path: string) {
	await fs.mkdirp('docs/manifest')
	let contents = await fs.readFile(`task/manifest/I${path}.ts`, 'utf8')
	contents = contents
		.replace(/@deepsight.gg\//g, './')
	await fs.writeFile(`docs/manifest/${path}.ts`, contents)

	// create d.ts version with declared const enums
	contents = contents
		.replace(/\/\*%(.*?)\*\//g, (match, group) => group)
		.replace(/\/\*<\*\/.*?\/\*>\*\//g, '')
		.replace(/export const/g, 'export type')
		.replace(/export enum/g, 'export const enum')
		.replace(/export /g, 'export declare ')

	await fs.writeFile(`docs/manifest/${path}.d.ts`, contents)
	await fs.copyFile(`docs/manifest/${path}.d.ts`, `static/manifest/${path}.d.ts`)
}
