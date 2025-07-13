export default process.env as Partial<{
	ENVIRONMENT: 'dev' | 'prod'
	PORT: string
	CONDUIT_ORIGIN: string
}>
