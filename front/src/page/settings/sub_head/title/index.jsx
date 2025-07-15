import useAuthStore from '@store/auth'
import Btn from '@cmp/fields/btn'
import Th from './th'
import useWarn from '@store/warn'
import Line from './line'
import useWarn from '@store/warn'

//Заголовок таблицы с кнопкой "Записать" - Страница настройки
export default function Title({ title, head, st, dataWarn }) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const { name, bName, action } = title

	// Окно подтверждения
	const warnCustom = useWarn(({ warnCustom }) => warnCustom)

	return (
		<section className='set-head' style={st}>
			<div className='title'>
				{isAuth && (
					<Btn
						title={bName || 'Записать'}
						icon={'/img/save.svg'}
						cls='set-btn'
						onClick={onClick}
					/>
				)}
				<span>{name}</span>
				<Line name='' type='product' action={() => {}} />
			</div>
			<Th head={head} />
		</section>
	)
	function onClick() {
		warnCustom(dataWarn, 'warn')
	}
}
