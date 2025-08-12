// Глобальная система обработки ошибок
class GlobalErrorHandler {
	constructor() {
		this.errorLog = [];
		this.maxLogSize = 100;
		this.isInitialized = false;
	}

	init() {
		if (this.isInitialized) return;

		// Обработчик для необработанных JavaScript ошибок
		window.addEventListener('error', (event) => {
			this.handleError({
				type: 'JAVASCRIPT_ERROR',
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error,
				timestamp: new Date().toISOString(),
				userAgent: navigator.userAgent,
				url: window.location.href,
			});
		});

		// Обработчик для необработанных Promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			this.handleError({
				type: 'UNHANDLED_PROMISE_REJECTION',
				message: event.reason?.message || 'Unhandled Promise Rejection',
				reason: event.reason,
				timestamp: new Date().toISOString(),
				userAgent: navigator.userAgent,
				url: window.location.href,
			});

			// Предотвращаем показ ошибки в консоли (опционально)
			// event.preventDefault();
		});

		// Обработчик для ошибок ресурсов (изображения, скрипты и т.д.)
		window.addEventListener(
			'error',
			(event) => {
				if (event.target !== window) {
					this.handleError({
						type: 'RESOURCE_ERROR',
						message: `Failed to load resource: ${
							event.target.src || event.target.href
						}`,
						element: event.target.tagName,
						source: event.target.src || event.target.href,
						timestamp: new Date().toISOString(),
						userAgent: navigator.userAgent,
						url: window.location.href,
					});
				}
			},
			true
		);

		this.isInitialized = true;
		console.log('Global Error Handler инициализирован');
	}

	handleError(errorInfo) {
		const errorId =
			Date.now().toString(36) + Math.random().toString(36).substr(2);
		const enrichedError = {
			id: errorId,
			...errorInfo,
			stack: errorInfo.error?.stack,
			userAgent: navigator.userAgent,
			timestamp: new Date().toISOString(),
			url: window.location.href,
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
		};

		// Добавляем в лог
		this.addToLog(enrichedError);

		// Логируем в консоль
		console.error(`Global Error [${errorId}]:`, enrichedError);

		// Отправляем на сервер (если нужно)
		this.reportToServer(enrichedError);

		// Показываем уведомление пользователю для критических ошибок
		if (this.isCriticalError(enrichedError)) {
			this.showUserNotification(enrichedError);
		}
	}

	addToLog(error) {
		this.errorLog.unshift(error);
		if (this.errorLog.length > this.maxLogSize) {
			this.errorLog.pop();
		}
	}

	isCriticalError(error) {
		// Определяем критические ошибки, которые требуют уведомления пользователя
		const criticalTypes = [
			'JAVASCRIPT_ERROR',
			'UNHANDLED_PROMISE_REJECTION',
		];
		return criticalTypes.includes(error.type);
	}

	showUserNotification(error) {
		// Используем систему уведомлений, если она доступна
		try {
			// Пытаемся импортировать и использовать систему уведомлений
			import('@cmp/notification')
				.then(({ notification }) => {
					notification.error(
						'Произошла неожиданная ошибка приложения',
						{
							errorId: error.id,
							autoClose: false,
							duration: 10000,
						}
					);
				})
				.catch(() => {
					// Если система уведомлений недоступна, используем fallback
					this.showFallbackNotification(error);
				});
		} catch {
			this.showFallbackNotification(error);
		}
	}

	showFallbackNotification(error) {
		// Резервный способ показа уведомления
		const notification = document.createElement('div');
		notification.className = 'global-error-notification';
		notification.innerHTML = `
			<div class="global-error-notification-content">
				<span class="global-error-icon">⚠️</span>
				<div class="global-error-text">
					<strong>Произошла ошибка</strong>
					<small>ID: ${error.id}</small>
				</div>
				<button class="global-error-close" onclick="this.parentElement.parentElement.remove()">×</button>
			</div>
		`;

		// Добавляем стили если их нет
		if (!document.getElementById('global-error-styles')) {
			const style = document.createElement('style');
			style.id = 'global-error-styles';
			style.textContent = `
				.global-error-notification {
					position: fixed;
					top: 20px;
					right: 20px;
					background: #f8d7da;
					border: 1px solid #f5c6cb;
					color: #721c24;
					padding: 12px;
					border-radius: 8px;
					box-shadow: 0 4px 12px rgba(0,0,0,0.1);
					z-index: 10000;
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
					max-width: 350px;
					animation: slideIn 0.3s ease;
				}
				.global-error-notification-content {
					display: flex;
					align-items: center;
					gap: 8px;
				}
				.global-error-icon {
					font-size: 20px;
				}
				.global-error-text {
					flex: 1;
				}
				.global-error-text strong {
					display: block;
					margin-bottom: 2px;
				}
				.global-error-text small {
					font-size: 11px;
					opacity: 0.7;
				}
				.global-error-close {
					background: none;
					border: none;
					font-size: 18px;
					cursor: pointer;
					color: #721c24;
					padding: 0;
					width: 20px;
					height: 20px;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				@keyframes slideIn {
					from { transform: translateX(100%); opacity: 0; }
					to { transform: translateX(0); opacity: 1; }
				}
			`;
			document.head.appendChild(style);
		}

		document.body.appendChild(notification);

		// Автоматически удаляем через 5 секунд
		setTimeout(() => {
			if (notification.parentElement) {
				notification.remove();
			}
		}, 5000);
	}

	async reportToServer(error) {
		try {
			// Здесь можно добавить отправку ошибки на сервер
			// await fetch('/api/error-report', {
			//     method: 'POST',
			//     headers: { 'Content-Type': 'application/json' },
			//     body: JSON.stringify(error)
			// });

			console.info('Отчет об ошибке подготовлен для отправки:', error.id);
		} catch (reportError) {
			console.error('Не удалось отправить отчет об ошибке:', reportError);
		}
	}

	getErrorLog() {
		return [...this.errorLog];
	}

	clearErrorLog() {
		this.errorLog = [];
	}

	// Метод для ручного добавления ошибок
	reportError(error, context = {}) {
		this.handleError({
			type: 'MANUAL_ERROR',
			message: error.message || error.toString(),
			error: error,
			context: context,
			timestamp: new Date().toISOString(),
		});
	}
}

// Создаем глобальный экземпляр
const globalErrorHandler = new GlobalErrorHandler();

export default globalErrorHandler;
