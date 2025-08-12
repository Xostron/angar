import { useNavigate, useRouteError } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './style.css'

function RouterError() {
	const navigate = useNavigate()
	const error = useRouteError()
	const [countdown, setCountdown] = useState(10)

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown(prev => {
				if (prev <= 1) {
					clearInterval(timer)
					navigate('/')
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [navigate])

	const handleGoHome = () => {
		navigate('/')
	}

	const handleReload = () => {
		window.location.reload()
	}

	const handleRetry = () => {
		navigate(-1) // Возвращаемся назад
	}

	return (
		<div className="router-error">
			<div className="router-error-container">
				<div className="router-error-icon">⚠️</div>
				<h1 className="router-error-title">Ошибка приложения</h1>
				<p className="router-error-message">
					Произошла неожиданная ошибка. Попробуйте перезагрузить страницу или вернуться на главную.
				</p>
				
				<div className="router-error-countdown">
					Автоматический переход на главную через <strong>{countdown}</strong> секунд
				</div>

				<div className="router-error-actions">
					<button 
						className="router-error-btn primary" 
						onClick={handleGoHome}
					>
						На главную
					</button>
					<button 
						className="router-error-btn secondary" 
						onClick={handleRetry}
					>
						Назад
					</button>
					<button 
						className="router-error-btn secondary" 
						onClick={handleReload}
					>
						Перезагрузить
					</button>
				</div>

				{error && process.env.NODE_ENV === 'development' && (
					<details className="router-error-details">
						<summary>Детали ошибки (для разработчиков)</summary>
						<div className="router-error-stack">
							<h4>Сообщение ошибки:</h4>
							<pre>{error.toString()}</pre>
							
							{error.stack && (
								<>
									<h4>Stack trace:</h4>
									<pre>{error.stack}</pre>
								</>
							)}
						</div>
					</details>
				)}
			</div>
		</div>
	)
}

export default RouterError
