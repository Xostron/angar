import { useEffect } from 'react'
import useAuthStore from '@store/auth'

// Восстановление логина при перезагрузке страницы
function Auth() {
	useEffect(() => {
		// Авторизация из URL (переход из родительского окна в iframe)
		const params = new URLSearchParams(window.location.search)
		const urlAccess = params.get('access')
		if (urlAccess) {
			localStorage.setItem('access', urlAccess)
			if (params.get('name')) localStorage.setItem('name', params.get('name'))
			// Убрать токен из адресной строки
			params.delete('access')
			params.delete('name')
			const search = params.toString()
			window.history.replaceState(
				null,
				'',
				window.location.pathname + (search ? '?' + search : ''),
			)
		}
		useAuthStore.setState({ name: localStorage.getItem('name') })
		useAuthStore.setState({ isAuth: !!localStorage.getItem('access') })
		if (localStorage.getItem('access')) useAuthStore.setState({ last: new Date() })
		else useAuthStore.setState({ last: null })
	}, [])
	return <></>
}

export default Auth
