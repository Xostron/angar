import useAuthStore from '@store/auth'
import useWarn from '@store/warn'
import useEquipStore from '@store/equipment'
import Btn from '@cmp/fields/btn'

//Элемент панели управления - кнопки пуск, стоп
export default function Item({ data, cur, set, deactive }) {
	const { title, value } = data
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const section = useEquipStore(({ section }) => section())

	// Имя секции
	const name = section.name

	// Окно подтверждения
	const obj = {
		type: 'warn',
		title: `Режим работы. ${name}`,
		text: `Вы действительно хотите переключить секцию в ${title.toUpperCase()} РЕЖИМ?`,
	}
	const [warn, warnCustom] = useWarn(({ warn, warnCustom }) => [warn, warnCustom])
	const fnYes = (_) => set(value)
	const onClick = () => (isAuth ? warnCustom(obj, fnYes) : warn('auth'))

	let cls = ['nav-item']
	if (cur == value) cls.push('active')
	if (!isAuth || deactive) cls.push('auth_bg')
	cls = cls.join(' ')

	return <Btn onClick={onClick} cls={cls} title={title} style={isAuth || cur == value ? {} : { color: 'var(--primary)' }} />
}
