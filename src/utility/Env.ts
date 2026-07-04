import { State } from 'kitsui'

interface Env extends State.Mutable<Env.Values> {
	init (): Promise<void>
	setDev (): this
	setProd (): this
}

namespace Env {
	export type Environment = 'dev' | 'prod'

	export interface Values {
		ENVIRONMENT: Environment
		CONDUIT_ORIGIN: string
		ORIGIN: string
	}
}

const Env = Object.assign(
	State<Env.Values>({
		ENVIRONMENT: undefined!,
		CONDUIT_ORIGIN: undefined!,
		ORIGIN: undefined!,
	}, false),
	{
		async init () {
			const raw = await fetch('/.env').then(res => res.text())
			const env = { ...Env.value }
			const acc = env as any as Record<string, string>
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

			Env.value = env
		},
		setDev () {
			Env.updateValue(env => {
				env.ENVIRONMENT = 'dev'
				return env
			})
			return Env
		},
		setProd () {
			Env.updateValue(env => {
				env.ENVIRONMENT = 'prod'
				return env
			})
			return Env
		},
	}
) as Env

export default Env
