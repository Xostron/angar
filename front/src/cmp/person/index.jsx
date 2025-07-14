import Btn from '@cmp/fields/btn'
import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import out from './fn'
import Entry from './entry'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/hook'

//Войти или Информация о пользователе
export default function Person({ style, cls }) {
	const { isAuth, name } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const warn = useWarn(({ warn }) => warn)
	const { refDialog, open, close } = useDialog()
	const title = isAuth ? name : 'Войти'
	let cl = ['control', cls]
	cl = cl.join(' ')
	return (
		<>
			<Btn title={title} icon={'/img/person.svg'} cls={cl} style={style} onClick={onClick} />
			<Dialog href={refDialog}>
				<Entry close={close} />
			</Dialog>
		</>
	)
	function onClick() {
		if (!isAuth) {
			open()
			return
		}
		warn('logout', out)
	}
}
