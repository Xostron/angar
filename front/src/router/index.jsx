import Main from '@page/main'
import Menu from '@page/menu'
import Test from '@page/test'
import NotFound from '@page/404'
import Service from '@page/service'
import RouterError from '@cmp/router-error'
import { createBrowserRouter } from 'react-router-dom'
import building from './building'

const router = createBrowserRouter([
	{
		path: 'test',
		element: <Test />,
		errorElement: <RouterError />,
	},
	{
		path: 'building/:build',
		element: <Menu />,
		children: building,
		errorElement: <RouterError />,
	},
	{
		path: '/',
		element: <Main />,
		children: [{ path: 'building', element: <Main /> }],
		errorElement: <RouterError />,
	},
	{
		path: 'service',
		element: <Service />,
		errorElement: <RouterError />,
	},
	{
		path: '*',
		element: <NotFound header />,
	},
], {
	errorElement: <RouterError />  // Глобальный обработчик ошибок
})

export default router
