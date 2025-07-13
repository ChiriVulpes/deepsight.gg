import { Component } from 'kitsui'

export default Component(component => {
	return component.style('wordmark-logo')
		.append(Component('img')
			.style('wordmark-logo-icon')
			.attributes.set('src', './static/logo.png')
		)
		.append(Component('img')
			.style('wordmark-logo-wordmark')
			.attributes.set('src', './static/wordmark.png')
		)
})
