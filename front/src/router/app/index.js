import Main from '@page/main'
import Menu from '@page/menu'
import NotFound from '@page/404'
import RouterError from '@cmp/router-error'
import building from '../building'
import { Navigate } from 'react-router'

export const routesApp = [
	{
		path: '',
		// element: <Navigate to='/building' replace={true} />,
		element: <Main />,
		children: [{ path: 'building', element: <Main /> }],
		errorElement: <RouterError />,
	},
	{
		path: 'building',
		element: <Main />,
		errorElement: <RouterError />,
	},
	{
		path: 'building/:build',
		element: <Menu />,
		children: building,
		errorElement: <RouterError />,
	},
	{
		path: '*',
		element: <NotFound header />,
	},
]
