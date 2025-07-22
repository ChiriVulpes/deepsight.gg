import { Component } from 'kitsui'
import type { ComponentName } from 'kitsui/utility/StyleManipulator'
import type { IconsKey } from 'style/icons'
import { Icons, ICONS_CODEPOINTS } from 'style/icons'

const Icon = Component((component, icon: Icons) => {
	return component
		.style('icon', `icon-${icon}` as ComponentName)
		.text.set(String.fromCodePoint(+ICONS_CODEPOINTS[icon]))
})

export default new Proxy({} as Record<IconsKey, Component>, {
	get (target, p: IconsKey) {
		return Icon(Icons[p])
	},
}) 
