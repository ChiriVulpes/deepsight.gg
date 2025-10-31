import type View from 'component/core/View'
import type { CollectionsParamsItemHash, CollectionsParamsItemName } from 'component/view/CollectionsView'
import CollectionsView from 'component/view/CollectionsView'
import DataView from 'component/view/DataView'
import SplashView from 'component/view/SplashView'
import Route from 'navigation/Route'
import { RoutePath } from 'navigation/RoutePath'

const Routes = [
	Route('/', SplashView),
	Route('/collections', CollectionsView),
	Route('/collections/$itemHash', CollectionsView as View.Builder.WithParams<CollectionsParamsItemHash | undefined>),
	Route('/collections/$moment/$itemName', CollectionsView as View.Builder.WithParams<CollectionsParamsItemName | undefined>),
	Route('/data', DataView),
	Route('/data/$table/$hash', DataView),
	Route('/data/$table/$hash/references', DataView),
]

RoutePath.setRoutes(Routes)
export default Routes
