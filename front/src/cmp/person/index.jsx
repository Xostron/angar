import Btn from '@cmp/fields/btn'
import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import out from './fn'


//Войти или Информация о пользователе
export default function Person({ style, cls }) {
	const { isAuth, name } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const warn = useWarn(({ warn }) => warn)

	const title = isAuth ? name : 'Войти'
	let cl = ['control', cls]
	cl = cl.join(' ')
	return (
		<>
			<Btn title={title} icon={'/img/person.svg'} cls={cl} style={style} onClick={onClick} />
		</>
	)
	function onClick() {
		if (!isAuth) {
			warn(null, 'person')
			return
		}
		warn('logout', 'warn', out)
	}
}
