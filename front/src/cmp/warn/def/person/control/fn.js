import useAuthStore from '@store/auth'
import { authLogin } from '@tool/api/auth'

//Авторизация на сайте
export default async function auth(form, clear) {
	try {
		const result = await authLogin(form)
		useAuthStore.setState({ isAuth: true, name: result.name })
		localStorage.setItem('access', result.access)
		localStorage.setItem('name', result.name)
		clear()
	} catch (error) {
		console.log(error)
		useAuthStore.setState({ isAuth: false, name: '' })
		localStorage.removeItem('access')
		localStorage.removeItem('name')
		clear()
	}
}
