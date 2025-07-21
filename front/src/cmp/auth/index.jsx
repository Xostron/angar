import { useEffect } from 'react'
import useAuthStore from '@store/auth'

function Auth() {
	const { checkAuth } = useAuthStore()
	useEffect(() => {
		useAuthStore.setState({ isAuth: checkAuth, name: localStorage.getItem('name') })
	}, [])
	return <></>
}

export default Auth
