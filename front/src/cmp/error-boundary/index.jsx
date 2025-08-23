import React from 'react'
import './style.css'

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { 
			hasError: false, 
			error: null, 
			errorInfo: null,
			errorId: null,
			countdown: 10
		}
		this.countdownTimer = null
	}

	static getDerivedStateFromError(error) {
		// Обновляем состояние, чтобы показать UI ошибки
		return { hasError: true }
	}

	componentDidCatch(error, errorInfo) {
		// Генерируем уникальный ID для ошибки
		const errorId = Date.now().toString(36) + Math.random().toString(36).substring(2)
		
		// Сохраняем детали ошибки в состоянии
		this.setState({
			error: error,
			errorInfo: errorInfo,
			errorId: errorId,
			countdown: 100000
		})

		// Запускаем таймер обратного отсчета
		this.startCountdown()

		// Логируем ошибку в консоль для разработчиков
		console.error('Unexpected Application Error:', {
			errorId,
			error: error.toString(),
			componentStack: errorInfo.componentStack,
			errorBoundary: this.constructor.name,
			timestamp: new Date().toISOString()
		})

		// Отправляем ошибку на сервер для мониторинга (если нужно)
		this.reportErrorToService(error, errorInfo, errorId)
	}

	reportErrorToService = async (error, errorInfo, errorId) => {
		try {
			// Отправляем информацию об ошибке на сервер
			const errorReport = {
				errorId,
				message: error.message,
				stack: error.stack,
				componentStack: errorInfo.componentStack,
				userAgent: navigator.userAgent,
				timestamp: new Date().toISOString(),
				url: window.location.href
			}

			// Здесь можно добавить отправку на сервер
			// await fetch('/api/error-report', {
			//     method: 'POST',
			//     headers: { 'Content-Type': 'application/json' },
			//     body: JSON.stringify(errorReport)
			// })
			
			console.info('Отчет об ошибке подготовлен:', errorReport)
		} catch (reportError) {
			console.error('Не удалось отправить отчет об ошибке:', reportError)
		}
	}

	startCountdown = () => {
		this.countdownTimer = setInterval(() => {
			this.setState(prevState => {
				const newCountdown = prevState.countdown - 1
				if (newCountdown <= 0) {
					clearInterval(this.countdownTimer)
					this.handleGoHome()
					return prevState
				}
				return { countdown: newCountdown }
			})
		}, 1000)
	}

	componentWillUnmount() {
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer)
		}
	}

	handleReload = () => {
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer)
		}
		window.location.reload()
	}

	handleGoHome = () => {
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer)
		}
		window.location.href = '/'
	}

	handleRetry = () => {
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer)
		}
		this.setState({ hasError: false, error: null, errorInfo: null, errorId: null, countdown: 10 })
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="error-boundary">
					<div className="error-boundary-container">
						<div className="error-boundary-icon">⚠️</div>
						<h1 className="error-boundary-title">Неожиданная ошибка приложения</h1>
						<p className="error-boundary-message">
							Произошла ошибка, которая помешала нормальной работе приложения.
						</p>
						
						<div className="error-boundary-countdown">
							Автоматический переход на главную через <strong>{this.state.countdown}</strong> секунд
						</div>
						
						{this.state.errorId && (
							<div className="error-boundary-id">
								<strong>ID ошибки:</strong> {this.state.errorId}
							</div>
						)}

						<div className="error-boundary-actions">
							<button 
								className="error-boundary-btn primary" 
								onClick={this.handleRetry}
							>
								Попробовать снова
							</button>
							<button 
								className="error-boundary-btn secondary" 
								onClick={this.handleGoHome}
							>
								На главную
							</button>
							<button 
								className="error-boundary-btn secondary" 
								onClick={this.handleReload}
							>
								Перезагрузить страницу
							</button>
						</div>

						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="error-boundary-details">
								<summary>Детали ошибки (для разработчиков)</summary>
								<div className="error-boundary-stack">
									<h4>Сообщение ошибки:</h4>
									<pre>{this.state.error.toString()}</pre>
									
									<h4>Stack trace:</h4>
									<pre>{this.state.error.stack}</pre>
									
									{this.state.errorInfo && (
										<>
											<h4>Component stack:</h4>
											<pre>{this.state.errorInfo.componentStack}</pre>
										</>
									)}
								</div>
							</details>
						)}
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
