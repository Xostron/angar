import Btn from '@cmp/fields/btn'
import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import { useState } from 'react'
import Entry from './entry'
import out from './fn'

//Войти или Информация о пользователе
export default function Person({ style, cls }) {
	const [show, setShow] = useState(false)
	const { isAuth, name } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const warn = useWarn(({ warn }) => warn)
	const title = isAuth ? name : 'Войти'
	const data = {
		type: 'warn',
		title: 'Выход из системы',
		text: 'Вы действительно хотите выйти из системы?',
		action: (_) => out(),
	}
	const onClick = isAuth ? (_) => warn(data) : (_) => setShow(true)
	let cl = ['control', cls]
	cl = cl.join(' ')
	return (
		<>
			<Btn title={title} icon={'/img/person.svg'} cls={cl} style={style} onClick={onClick} />
			<Entry show={show} setShow={setShow} />
		</>
	)
}
