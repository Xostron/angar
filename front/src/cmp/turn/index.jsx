import { useShallow } from 'zustand/react/shallow'
import { useParams } from 'react-router-dom'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import useDialog from '@cmp/dialog/use_dialog'
import useWarn from '@store/warn'
import Dialog from '@cmp/dialog'
import EntryPerson from '@cmp/person/entry'
import EntryTurn from './entry'
import Btn from '@cmp/fields/btn'

//Включить/Выключить
export default function Turn({ style, cls }) {
	const { build } = useParams()
	const warn = useWarn(({ warn }) => warn)
	const { refDialog, open, close } = useDialog()
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const [start] = useInputStore(useShallow(({ input }) => [input?.retain?.[build]?.start]))
	const img = isAuth ? '/img/turn.svg' : '/img/turn_b.svg'
	const st = isAuth ? style : { ...style, color: 'var(--primary)' }
	let cl = ['control', cls]
	cl = cl.join(' ')
	// Диалоговое окно действий ("Вкл системы" или "Авторизация")
	const entry = isAuth ? <EntryTurn close={close} /> : <EntryPerson close={close} />
	// Диалоговое окно - предупреждение
	const data = {
		type: 'warn',
		title: 'Авторизация',
		text: 'Необходимо войти в систему',
		action: (_) => {open()},
	}
	return (
		<>
			<Btn
				cls={cl}
				style={st}
				icon={img}
				title={start ? 'Вкл.' : 'Выкл.'}
				onClick={onClick}
			/>
			<Dialog href={refDialog}>
				{entry}
			</Dialog>
		</>
	)
	function onClick() {
		if (!isAuth) {
			warn(data)
			return
		}
		open()
	}
}
