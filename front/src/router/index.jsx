import { createBrowserRouter } from 'react-router-dom'
import RouterError from '@cmp/router-error'
import { routesApp } from './app'
import NotFound from '@page/404'
import App from '@src/page/App'

const router = createBrowserRouter([
    {
        path:'/',
        element:<App/>,
        children:routesApp
    },
	{
		path: '*',
		element: <NotFound header />,
	},
], {
	errorElement: <RouterError />  // Глобальный обработчик ошибок
})

export default router
