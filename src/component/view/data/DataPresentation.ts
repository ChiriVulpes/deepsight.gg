export const DATA_PRESENTATION = Symbol('DataPresentation')

export interface PgcrPresentation {
	activityName?: string
	activityIcon?: string
	durationSeconds?: number
	period?: string
}

export interface DataPresentation {
	pgcr?: PgcrPresentation
}

export type WithDataPresentation<T extends object> = T & {
	[DATA_PRESENTATION]?: DataPresentation
}

export function setDataPresentation<T extends object> (definition: T, presentation: DataPresentation): WithDataPresentation<T> {
	Object.defineProperty(definition, DATA_PRESENTATION, {
		value: presentation,
		enumerable: false,
		configurable: true,
	})
	return definition as WithDataPresentation<T>
}
