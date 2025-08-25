import { createBrowserRouter } from 'react-router-dom'
import RouterError from '@cmp/router-error'
import { routesApp } from './app'
import NotFound from '@page/404'
import App from '@src/page/App'
import Test from '@page/test'
import Service from '@page/service'

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <App />,
			children: routesApp,
		},
		{
			path: 'service',
			element: <Service />,
			errorElement: <RouterError />,
		},
		{
			path: 'test',
			element: <Test />,
			errorElement: <RouterError />,
		},
		{
			path: '*',
			element: <NotFound header />,
		},
	],
	{
		errorElement: <RouterError />, // Глобальный обработчик ошибок
	}
)

export default router
