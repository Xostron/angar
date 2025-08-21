import { useState, useEffect, useCallback } from 'react'
import './style.css'

// Хранилище уведомлений
let notificationStore = {
	notifications: [],
	listeners: [],
	subscribe: function(listener) {
		this.listeners.push(listener)
		return () => {
			this.listeners = this.listeners.filter(l => l !== listener)
		}
	},
	notify: function(notification) {
		const id = Date.now().toString(36) + Math.random().toString(36).substring(2)
		const newNotification = {
			id,
			timestamp: new Date().toISOString(),
			...notification
		}
		this.notifications.unshift(newNotification)
		this.listeners.forEach(listener => listener(this.notifications))
		
		// Автоматически удаляем через указанное время
		if (notification.autoClose !== false) {
			setTimeout(() => {
				this.remove(id)
			}, notification.duration || 5000)
		}
	},
	remove: function(id) {
		this.notifications = this.notifications.filter(n => n.id !== id)
		this.listeners.forEach(listener => listener(this.notifications))
	}
}

// Хук для использования уведомлений
export function useNotification() {
	const [notifications, setNotifications] = useState([])

	useEffect(() => {
		const unsubscribe = notificationStore.subscribe(setNotifications)
		return unsubscribe
	}, [])

	const showNotification = useCallback((notification) => {
		notificationStore.notify(notification)
	}, [])

	const removeNotification = useCallback((id) => {
		notificationStore.remove(id)
	}, [])

	// Функции для разных типов уведомлений
	const showError = useCallback((message, options = {}) => {
		showNotification({
			type: 'error',
			title: 'Ошибка',
			message,
			...options
		})
	}, [showNotification])

	const showSuccess = useCallback((message, options = {}) => {
		showNotification({
			type: 'success',
			title: 'Успешно',
			message,
			...options
		})
	}, [showNotification])

	const showWarning = useCallback((message, options = {}) => {
		showNotification({
			type: 'warning',
			title: 'Предупреждение',
			message,
			...options
		})
	}, [showNotification])

	const showInfo = useCallback((message, options = {}) => {
		showNotification({
			type: 'info',
			title: 'Информация',
			message,
			...options
		})
	}, [showNotification])

	return {
		notifications,
		showNotification,
		showError,
		showSuccess,
		showWarning,
		showInfo,
		removeNotification
	}
}

// Глобальные функции для использования без хука
export const notification = {
	show: (notification) => notificationStore.notify(notification),
	error: (message, options = {}) => notificationStore.notify({
		type: 'error',
		title: 'Ошибка',
		message,
		...options
	}),
	success: (message, options = {}) => {
		notificationStore.notify({
			type: 'success',
			title: 'Успешно',
			message,
			...options
		})
	},
	warning: (message, options = {}) => notificationStore.notify({
		type: 'warning',
		title: 'Предупреждение',
		message,
		...options
	}),
	info: (message, options = {}) => notificationStore.notify({
		type: 'info',
		title: 'Информация',
		message,
		...options
	}),
	remove: (id) => notificationStore.remove(id)
}

// Компонент для отображения одного уведомления
function NotificationItem({ notification, onRemove }) {
	const getIcon = () => {
		switch (notification.type) {
			case 'error': return '❌'
			case 'success': return '✅'
			case 'warning': return '⚠️'
			case 'info': return 'ℹ️'
			default: return '📢'
		}
	}

	return (
		<div 
			className={`notification notification-${notification.type}`}
			onClick={() => onRemove(notification.id)}
			style={{ cursor: 'pointer' }}
		>
			<div className="notification-icon">
				{getIcon()}
			</div>
			<div className="notification-content">
				{notification.title && (
					<div className="notification-title">{notification.title}</div>
				)}
				<div className="notification-message">{notification.message}</div>
				{notification.errorId && (
					<div className="notification-error-id">ID: {notification.errorId}</div>
				)}
			</div>
			<button 
				className="notification-close" 
				onClick={(e) => {
					e.stopPropagation()
					onRemove(notification.id)
				}}
			>
				×
			</button>
		</div>
	)
}

// Основной компонент контейнера уведомлений
function NotificationContainer() {
	const { notifications, removeNotification } = useNotification()

	return (
		<div className="notification-container">
			{notifications.map(notification => (
				<NotificationItem
					key={notification.id}
					notification={notification}
					onRemove={removeNotification}
				/>
			))}
		</div>
	)
}

export default NotificationContainer
