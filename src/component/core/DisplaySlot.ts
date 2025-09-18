import { Component } from 'kitsui'
import Slot from 'kitsui/component/Slot'

export default Component((component): Slot => {
	return component.and(Slot).noDisplayContents()
})
