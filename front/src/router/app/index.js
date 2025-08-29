import Main from '@page/main'
import Menu from '@page/menu'
import NotFound from '@page/404'
import RouterError from '@cmp/router-error'
import building from '../building'
import { Navigate } from 'react-router'
import Service from '@page/service'

export const routesApp = [
	{
		path: '',
		element: <Navigate to='/building' replace={true} />,
	},
	{
		path: 'building',
		element: <Main />,
		errorElement: <RouterError />,
	},
	{
		path: 'building/service',
		element: <Service header />,
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
