import { useEffect } from 'react'
import useAuthStore from '@store/auth'

// Восстановление логина при перезагрузке страницы
function Auth() {
	const checkAuth = useAuthStore((s) => s.checkAuth)
	useEffect(() => {
		useAuthStore.setState({ name: localStorage.getItem('name') })
		useAuthStore.setState({ isAuth: checkAuth })
		if (checkAuth) useAuthStore.setState({ last: new Date() })
		else useAuthStore.setState({ last: null })
	}, [])
	return <></>
}

export default Auth
