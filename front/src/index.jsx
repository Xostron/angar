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
import View from '@cmp/view'
import './style.css'
import './style_large.css'

// Инициализируем глобальный обработчик ошибок
globalErrorHandler.init()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<ErrorBoundary>
		{/* Проверка авторизации */}
		<Auth />
		{/* Инициализация webSocket */}
		<Socket />
		{/* Обработка клавиатуры */}
		<Keyboard />
		{/* Вывод версии ПО */}
		<Version />
		{/* Уведомления */}
		<NotificationContainer />
		{/* Размер экрана */}
		<View />
		{/* {process.env.PUBLIC_DESIGN === 'v2' && (
			<img className='build2-background-img' src='/img/v2/angar1.jpg' />
		)} */}
		<RouterProvider router={router} />
	</ErrorBoundary>
)
