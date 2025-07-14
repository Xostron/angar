import useAuthStore from '@store/auth'
import Btn from '@cmp/fields/btn'
import Th from './th'
import useWarn from '@store/warn'
import Line from './line'

//Заголовок таблицы с кнопкой "Записать"
export default function Title({ title, head, st, warn }) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const { name, bName, action } = title

	// Окно подтверждения
	const onWarn = useWarn(({ warnCustom }) => warnCustom)
	const onClick = () => onWarn(warn)
	return (
		<section className='set-head' style={st}>
			<div className='title'>
				{isAuth && <Btn title={bName || 'Записать'} icon={'/img/save.svg'} cls='set-btn' onClick={onClick} />}
				<span>{name}</span>
				<Line name='' type='product' action={() => {}} />
			</div>
			<Th head={head} />
		</section>
	)
}
