import lint from 'lint'

export { lint }
export default [
	...lint(import.meta.dirname),
	{
		ignores: ['static/manifest/Enums.d.ts'],
	},
]
