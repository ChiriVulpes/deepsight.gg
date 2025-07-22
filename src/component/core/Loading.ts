import { Component, Kit } from 'kitsui'
import ViewTransition from 'utility/ViewTransition'

Kit.Loading.extend(loading => {
	const spinner = loading.spinner
	loading.spinner.append(...([1, 2, 3, 4] as const).map(i => Component().style('loading-spinner-dot', `loading-spinner-dot-${i}`)))
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	const interval = setInterval(async () => {
		for (const dot of spinner.getChildren())
			dot.style('loading-spinner-dot--no-animate')
		await new Promise(resolve => setTimeout(resolve, 10))
		for (const dot of spinner.getChildren())
			dot.style.remove('loading-spinner-dot--no-animate')
	}, 2000)

	loading.onSet((loading, owner, state) => {
		loading.errorText.text.bind(state.error.map(owner, error => error?.message ?? (quilt => quilt['shared/errored']())))
	})

	loading.onLoad((loading, display) => ViewTransition.perform('view', display))

	loading.onRemoveManual(() => clearInterval(interval))
	return {}
})
Kit.Loading.styleTargets({
	Loading: 'loading',
	LoadingLoaded: 'loading--loaded',
	Spinner: 'loading-spinner',
	ProgressBar: 'loading-progress',
	ProgressBarProgressUnknown: 'loading-progress--unknown',
	MessageText: 'loading-message',
	ErrorIcon: 'loading-error-icon',
	ErrorText: 'loading-error',
})

export default Kit.Loading
