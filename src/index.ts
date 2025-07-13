import WordmarkLogo from 'component/WordmarkLogo'
import { Component } from 'kitsui'
import ActiveListener from 'kitsui/utility/ActiveListener'
import FocusListener from 'kitsui/utility/FocusListener'
import HoverListener from 'kitsui/utility/HoverListener'
import Mouse from 'kitsui/utility/Mouse'
import Viewport from 'kitsui/utility/Viewport'
import Relic from 'Relic'
import DevServer from 'utility/DevServer'
import Env from 'utility/Env'
import Text from 'utility/Text'

export default async function () {
	void Relic.init()

	Component.allowBuilding()
	Text.init()

	Component.getBody().style('body')
	Component('a')
		.and(WordmarkLogo)
		.attributes.set('href', location.origin)
		.appendTo(document.body)

	await Env['init']()

	DevServer.listen()
	HoverListener.listen()
	ActiveListener.listen()
	FocusListener.listen()
	Mouse.listen()
	Viewport.listen()
}
