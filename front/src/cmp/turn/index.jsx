import { useShallow } from 'zustand/react/shallow'
import { useParams } from 'react-router-dom'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import Btn from '@cmp/fields/btn'

//Включить/Выключить
export default function Turn({ style, cls }) {
	const { build } = useParams()
	const warn = useWarn((s) => s.warn)
	const isAuth = useAuthStore((s) => s.isAuth)
	const start = useInputStore((s) => s.input?.retain?.[build]?.start)

	const img = isAuth ? '/img/turn.svg' : '/img/turn_b.svg'
	const st = isAuth ? style : { ...style, color: 'var(--primary)' }
	let cl = ['control', cls]
	cl = cl.join(' ')

	return (
		<>
			<Btn
				cls={cl}
				style={st}
				icon={img}
				title={start ? 'Вкл.' : 'Выкл.'}
				onClick={onClick}
			/>
		</>
	)
	function onClick() {
		// Если склад уже включен, то не спрашивать авторизацию ||
		// Пользователь Авторизован -> окно управления складом
		if (start || isAuth) {
			warn({ build }, 'turn')
			return
		}
		// Если не авторизован -> предупреждение
		warn('auth', 'warn', () => warn(null, 'person'))
	}
}
