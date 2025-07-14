import useAuthStore from '@store/auth'
import useOutputStore from '@store/output'
import useWarn from '@store/warn'
import Btn from '@cmp/fields/btn'

//Заголовок таблицы с кнопкой "Записать"
export default function Title({ title }) {
	const { sendSens } = useOutputStore()
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	// Окно подтверждения
	const warn = useWarn(({ warn }) => warn)
	const onClick = () => warn('save', sendSens)

	return (
		<div className='title '>
			{isAuth && <Btn title={'Записать'} icon={'/img/save.svg'} onClick={onClick} />}
			<p>{title}</p>
		</div>
	)
}
