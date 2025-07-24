import { Component } from 'kitsui'
import ActiveListener from 'kitsui/utility/ActiveListener'
import FocusListener from 'kitsui/utility/FocusListener'
import HoverListener from 'kitsui/utility/HoverListener'
import Mouse from 'kitsui/utility/Mouse'
import Viewport from 'kitsui/utility/Viewport'
import Navigator from 'navigation/Navigate'
import Relic from 'Relic'
import DevServer from 'utility/DevServer'
import Env from 'utility/Env'
import Text from 'utility/Text'

export default async function () {
	Component.allowBuilding()
	Text.init()

	Component.getBody().style('body')

	await Env['init']()
	void Relic.init()

	DevServer.listen()
	HoverListener.listen()
	ActiveListener.listen()
	FocusListener.listen()
	Mouse.listen()
	Viewport.listen()

	await Navigator().fromURL()
}
