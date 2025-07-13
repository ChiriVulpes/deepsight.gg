import Env from 'utility/Env'
import Style from 'utility/Style'

namespace DevServer {
	export function listen () {
		if (Env.ENVIRONMENT !== 'dev')
			return

		const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
		const wsUrl = `${wsProtocol}//${location.host}`
		const socket = new WebSocket(wsUrl)

		socket.addEventListener('message', event => {
			try {
				if (typeof event.data !== 'string')
					throw new Error('Unsupported message data')

				const message = JSON.parse(event.data) as { type?: string, data?: any }
				const { type } = typeof message === 'object' && message !== null ? message : {}

				switch (type) {
					case 'notify:css':
						void Style.reload()
						break
				}
			}
			catch {
				console.warn('Unsupported devserver message:', event.data)
			}
		})
	}
}

export default DevServer
