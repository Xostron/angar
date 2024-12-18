import useAuthStore from '@store/auth'

//Авторизация на сайте
export default function auth(login, password, setShow, name) {
	useAuthStore.setState({ isAuth: true, name })
	setShow(false)
}
