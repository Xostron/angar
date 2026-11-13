import useAuthStore from '@store/auth'
import { authLogin } from '@tool/api/auth'
import { notification } from '@cmp/notification'

//Авторизация на сайте
export default async function onLogin(form, clear) {
	try {
		const result = await authLogin(form)
		useAuthStore.setState({ isAuth: true, name: result.name, last: new Date() })
		localStorage.setItem('access', result.access)
		localStorage.setItem('name', result.name)
		clear()
	} catch (error) {
		useAuthStore.setState({ isAuth: false, name: '', last: null })
		localStorage.removeItem('access')
		localStorage.removeItem('name')
		notification.error('Неверный логин или пароль', { errorId: 401 })
		notification.remove(401)
	}
}
