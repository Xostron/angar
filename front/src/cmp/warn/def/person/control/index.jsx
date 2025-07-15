import Btn from '@cmp/fields/btn'
import auth from './fn'
import useEquipStore from '@store/equipment'
import useWarn from '@store/warn'
//Кнопки войти и отмена
export default function Control({ login, password }) {
	const [b] = useEquipStore(({ build }) => [build()])
	const { clear } = useWarn(({ clear }) => ({ clear }))

	return (
		<div className='entry-control'>
			<Btn
				title={'Войти'}
				icon={'/img/entry.svg'}
				onClick={(_) => auth(login, password, clear, b?.company?.name)}
			/>
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={(_) => clear()} />
		</div>
	)
}
