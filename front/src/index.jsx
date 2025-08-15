import Warn from '@cmp/warn'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Keyboard from '@cmp/keyboard'
import Version from '@cmp/version'
import Socket from '@cmp/socket'
import ErrorBoundary from '@cmp/error-boundary'
import NotificationContainer from '@cmp/notification'
import globalErrorHandler from '@tool/error-handler'
import router from './router'
import Auth from '@cmp/auth'
import './style.css'
import './style_large.css'

// Инициализируем глобальный обработчик ошибок
globalErrorHandler.init()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<ErrorBoundary>
		{/*<React.StrictMode> */}
		<Auth />
		<Warn />
		<Socket />
		<Keyboard />
		<Version />
		<NotificationContainer />
		<RouterProvider router={router} />
		{/*</React.StrictMode> */}
	</ErrorBoundary>
)
