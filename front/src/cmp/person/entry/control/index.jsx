import Btn from '@cmp/fields/btn'
import auth from './fn'
import useEquipStore from '@store/equipment'

//Кнопки войти и отмена
export default function Control({ login, password, setShow }) {
	const [b] = useEquipStore(({ build }) => [build()])
	return (
		<div className='entry-control'>
			<Btn title={'Войти'} icon={'/img/entry.svg'} onClick={(_) => auth(login, password, setShow, b?.company?.name)} />
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={(_) => setShow(false)} />
		</div>
	)
}
