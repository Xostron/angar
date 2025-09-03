import { useEffect } from 'react'
import useAuthStore from '@src/store/auth'
const TIME = 15 * 60 * 1000 // Logout через 15мин

// Автоматически выйти из логина, если он неактивен в течении N мин
export default function AutoLogout({}) {
	const isAuth = useAuthStore((s) => s.isAuth)
	const last = useAuthStore((s) => s.last)
	const logout = useAuthStore((s) => s.logout)

	// Обновляем обработчик при входе/выходе, иначе замыкается прошлое состояние isAuth
	useEffect(() => {
		// Обновление времени последней активности дфые
		function onClick(e) {
			if (isAuth) useAuthStore.setState({ last: new Date() })
		}
		document.addEventListener('click', onClick)
		// cleanup
		return () => document.removeEventListener('click', onClick)
	}, [isAuth])

	// Автосброс по таймеру: при каждой активности обнволяется last (см. useEffect выше),
	// который обновляет ссылку на timer и таймаут начинается заново,
	// при бездействии пользователя, таймер досчитает до конца и выйдет из текущего логина
	// * если пользователь вышел, timer = undefined
	useEffect(() => {
		let timer
		// Если под логином, инциируем таймер
		if (last) timer = setTimeout(() => logout(), TIME)
		// Вышли из логина, удаляем интервал
		else clearTimeout(timer)
		// cleanup от старых обработчиков
		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [last])
	return <></>
}
