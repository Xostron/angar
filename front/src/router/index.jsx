import Main from '@page/main'
import Menu from '@page/menu'
import Test from '@page/test'
import NotFound from '@page/404'

import { createBrowserRouter } from 'react-router-dom'
import building from './building'

const router = createBrowserRouter([
	{
		path: 'test',
		element: <Test />,
	},
	{
		path: 'building/:build',
		element: <Menu />,
		children: building,
	},
	{
		path: '/',
		element: <Main />,
		children: [{ path: 'building', element: <Main /> }],
	},
	{
		path: '*',
		element: <NotFound header />,
	},
])

export default router
