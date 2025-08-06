import { Component } from 'kitsui'
import Slot from 'kitsui/component/Slot'

export default Component((component): Slot => {
	return component.and(Slot).tweak(slot => slot.useDisplayContents.value = false)
})
