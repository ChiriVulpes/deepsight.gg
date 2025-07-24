import type Route from 'navigation/Route'
import type { RoutePathInput } from 'navigation/Route'
import type Routes from 'navigation/Routes'

export type RoutePath = ((typeof Routes)[number] extends Route<infer PATH, any> ? PATH : never) extends infer ROUTE_PATH extends string ?

	{ [KEY in ROUTE_PATH]: RoutePathInput<KEY> } extends infer ROUTE_PATH_INPUT ?

	ROUTE_PATH_INPUT[keyof ROUTE_PATH_INPUT]

	: never
	: never

export namespace RoutePath {
	let routes!: typeof Routes
	export function setRoutes (routesIn: typeof Routes): void {
		routes = routesIn
	}

	export function is (value?: string | null): value is RoutePath {
		return !!value && routes.some(route => route.path === value || !!route.match(value))
	}
}
