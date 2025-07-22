import Conduit from 'conduit.deepsight.gg'
import { State } from 'kitsui'
import Env from 'utility/Env'

let resolveConduit: (conduit: Conduit) => void
const connected = new Promise<Conduit>(resolve => resolveConduit = resolve)
export default Object.assign(
	State<Conduit | undefined>(undefined) as State<Conduit>,
	{
		connected,
		async init (this: State<Conduit | undefined>) {
			const conduit = await Conduit({
				service: Env.CONDUIT_ORIGIN,
			})
			this.asMutable?.setValue(conduit)
			resolveConduit(conduit)
		},
	}
)
