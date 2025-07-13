interface Env {
	ENVIRONMENT: 'dev' | 'prod'
	BUNGIE_API_KEY: string
	BUNGIE_AUTH_CLIENT_ID: string
	BUNGIE_AUTH_CLIENT_SECRET: string
}

class Env {

	protected async init () {
		const raw = await fetch('/.env').then(res => res.text())
		const acc = this as any as Record<string, string>
		for (const line of raw.split('\n')) {
			if (line.startsWith('#') || !line.trim())
				continue

			let [key, value] = line.split('=')
			if (!key || !value)
				throw new Error(`Invalid .env line: ${line}`)

			key = key.trim()
			value = value.trim()
			if (value.startsWith('"') && value.endsWith('"'))
				value = value.slice(1, -1)

			acc[key] = value
		}
	}

}

export default new Env()
