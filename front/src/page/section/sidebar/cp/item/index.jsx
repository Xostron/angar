import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import useEquipStore from '@store/equipment'
import Btn from '@cmp/fields/btn'

// Кнопки панели управления режимами секции
export default function Item({ data, cur, set, deactive }) {
	const { title, value } = data
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const section = useEquipStore(({ section }) => section())

	// Имя секции
	const name = section.name

	// Окно подтверждения
	const warn = useWarn((s) => s.warn)
	const obj = {
		type: 'warn',
		title: `Режим работы. ${name}`,
		text: `Вы действительно хотите переключить секцию в ${title.toUpperCase()} РЕЖИМ?`,
		fnYes:()=>set(value)
	}

	const onClick = () =>
		isAuth ? warn(obj, 'warn') : warn('auth', 'warn', () => warn(null, 'person'))

	let cls = ['nav-item']
	if (cur == value) cls.push('active')
	if (!isAuth || deactive) cls.push('auth_bg')
	cls = cls.join(' ')

	return (
		<>
			<Btn
				onClick={onClick}
				cls={cls}
				title={title}
				style={isAuth || cur == value ? {} : { color: 'var(--primary)' }}
			/>
		</>
	)
}
