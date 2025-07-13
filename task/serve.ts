import { Middleware, Server, Task } from 'task'
import Env from './utility/Env'

declare module 'task/server/Server' {
	interface MessageTypeRegistry {
		'notify:ts': null
		'notify:css': null
	}
}

const _ = undefined
export default Task('serve', async task => {
	if (!Env.PORT)
		throw new Error('Must set PORT environment variable')

	const spaIndexRewrite = `(${[
		'not ends_with(http.request.uri.path, ".html")',
		'not ends_with(http.request.uri.path, ".js")',
		'not ends_with(http.request.uri.path, ".css")',
		'not ends_with(http.request.uri.path, ".woff")',
		'not ends_with(http.request.uri.path, ".woff2")',
		'not ends_with(http.request.uri.path, ".ttf")',
		'not ends_with(http.request.uri.path, ".webp")',
		'not ends_with(http.request.uri.path, ".png")',
		'http.request.uri.path ne "/.env"',
	].join(' and ')})`
	const router = Middleware((definition, req, res) => _
		?? Middleware.Static(definition, req, res)
		?? Middleware.E404(definition, req, res)
	)
	const server = await Server({
		port: +Env.PORT,
		root: 'out',
		serverIndex: '/index.html',
		spaIndexRewrite,
		router,
	})

	await server.listen()
	server.socket()
	server.announce()

	task.watch('out/index.js', Task(null, () => {
		server.sendMessage('notify:ts', null)
	}))

	task.watch('out/style/index.css', Task(null, () => {
		server.sendMessage('notify:css', null)
	}))
})
