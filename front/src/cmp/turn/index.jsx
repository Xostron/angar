import { useShallow } from 'zustand/react/shallow'
import { useParams } from 'react-router-dom'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import Btn from '@cmp/fields/btn'

//Включить/Выключить
export default function Turn({ style, cls }) {
	const { build } = useParams()
	const [warn, warnCustom] = useWarn(({ warn, warnCustom }) => [warn, warnCustom])
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const [start] = useInputStore(useShallow(({ input }) => [input?.retain?.[build]?.start]))

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
		// Если не авторизован -> предупреждение
		if (!isAuth) {
			warn('auth', 'warn', () => warn(null, 'person'))
			return
		}
		// Авторизован -> окно управления складом
		warnCustom({ build }, 'turn')
	}
}
