import CollectionsView from 'component/view/CollectionsView'
import SplashView from 'component/view/SplashView'
import Route from 'navigation/Route'
import { RoutePath } from 'navigation/RoutePath'

const Routes = [
	Route('/', SplashView),
	Route('/collections', CollectionsView),
	// Route('/collections/$itemId', ItemView),
]

RoutePath.setRoutes(Routes)
export default Routes
