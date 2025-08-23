import { useEffect } from 'react'
import useAuthStore from '@store/auth'

// Проверка авторизации
function Auth() {
	const checkAuth = useAuthStore((s) => s.checkAuth)
	useEffect(() => {
		useAuthStore.setState({ isAuth: checkAuth, name: localStorage.getItem('name') })
	}, [])
	return <></>
}

export default Auth
