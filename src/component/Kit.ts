import { Component, Kit } from 'kitsui'
import ViewTransition from 'utility/ViewTransition'

declare module 'kitsui/component/Tooltip' {
	interface TooltipExtensions {
		readonly content: Component
		readonly header: Component
		readonly body: Component
		readonly extra: Component
	}
}

export default function styleKit () {
	////////////////////////////////////
	//#region Loading

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

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Popover

	Kit.Popover.styleTargets({
		Popover: 'popover',
		PopoverCloseSurface: 'popover-close-surface',
		Popover_AnchoredTop: 'popover--anchored-top',
		Popover_AnchoredLeft: 'popover--anchored-left',
	})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Dialog

	Kit.Dialog.styleTargets({
		Dialog: 'dialog',
		Dialog_Open: 'dialog--open',
	})

	//#endregion
	////////////////////////////////////

	////////////////////////////////////
	//#region Tooltip

	Kit.Tooltip.extend(tooltip => {
		const main = Component()
			.style('tooltip-block')
			.style.bind(tooltip.visible, 'tooltip-block--visible')
			.appendTo(tooltip)

		const content = Component()
			.style('tooltip-content')
			.appendTo(main)
		const header = Component()
			.style('tooltip-header')
			.appendTo(content)
		const body = Component()
			.style('tooltip-body')
			.appendTo(content)

		tooltip.extendJIT('extra', () => Component()
			.style('tooltip-content', 'tooltip-extra')
			.appendTo(Component()
				.style('tooltip-block')
				.style.bind(tooltip.visible, 'tooltip-block--visible')
				.appendTo(tooltip.style('tooltip--has-extra'))
			)
		)
		return {
			content,
			header,
			body,
		}
	})
	Kit.Tooltip.styleTargetsPartial<Component.PartialStyleTargets<Kit.Tooltip, Kit.Popover>>({
		Tooltip: 'tooltip',
	})

	//#endregion
	////////////////////////////////////
}
