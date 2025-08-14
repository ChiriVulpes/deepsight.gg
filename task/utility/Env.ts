const Env = process.env as Partial<{
	ENVIRONMENT: 'dev' | 'prod'
	ORIGIN: string
	PORT: string
	CONDUIT_ORIGIN: string
}>

if (!Env.ORIGIN)
	throw new Error('Must set ORIGIN environment variable')

const localhostServerPrefix = 'https://localhost:'
Env.PORT ??= Env.ORIGIN?.startsWith(localhostServerPrefix) ? Env.ORIGIN.slice(localhostServerPrefix.length) : Env.PORT

export default Env
