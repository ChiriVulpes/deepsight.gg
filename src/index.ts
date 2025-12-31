import styleKit from 'component/Kit'
import { Component } from 'kitsui'
import ActiveListener from 'kitsui/utility/ActiveListener'
import FocusListener from 'kitsui/utility/FocusListener'
import HoverListener from 'kitsui/utility/HoverListener'
import Mouse from 'kitsui/utility/Mouse'
import Viewport from 'kitsui/utility/Viewport'
import Profile from 'model/Profile'
import Navigator from 'navigation/Navigate'
import Relic from 'Relic'
import Arrays from 'utility/Arrays'
import ConduitBroadcastHandler from 'utility/ConduitBroadcastHandler'
import DevServer from 'utility/DevServer'
import Env from 'utility/Env'
import Strings from 'utility/Strings'
import Text from 'utility/Text'

Arrays.applyPrototypes()
Strings.applyPrototypes()

export default async function () {
	Component.allowBuilding()
	Text.init()

	Component.getBody().style('body')

	await Env['init']()
	void Relic.init()
	void Profile.init()

	DevServer.listen()
	HoverListener.listen()
	ActiveListener.listen()
	FocusListener.listen()
	Mouse.listen()
	Viewport.listen()

	Component.getBody().monitorScrollEvents()
	Component.getDocument().monitorScrollEvents()
	Component.getWindow().monitorScrollEvents()

	styleKit()

	void ConduitBroadcastHandler.listen()

	await Navigator().fromURL()
}
