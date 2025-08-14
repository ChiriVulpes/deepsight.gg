import { Component } from 'kitsui'
import Env from 'utility/Env'

export default Component(component => {
	return component.style('wordmark-logo')
		.append(Component('img')
			.style('wordmark-logo-icon')
			.attributes.set('src', `${Env.ORIGIN}/static/logo.png`)
		)
		.append(Component('img')
			.style('wordmark-logo-wordmark')
			.attributes.set('src', `${Env.ORIGIN}/static/wordmark.png`)
		)
})
