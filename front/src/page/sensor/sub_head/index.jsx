import Turn from '@cmp/turn'
import Person from '@cmp/person'
import Title from './title'

export default function SubHead({ title, type = '' }) {
	const listSen = type == 'pui' ? { gridTemplateColumns: ' 70% repeat(2, 1fr)' } : {}
	return (
		<>
			<Turn cls='sen-header-turn' />
			<div className='sen-header-sub' style={listSen}>
				<Title title={title} />
				{type !== 'pui' && <p>Состояние</p>}
				{type !== 'pui' && <p>Коррекция</p>}
				{type !== 'pui' && <p>Датчик</p>}
				<p>Результат</p>
				<p>Ед.измерения</p>
			</div>
			<Person cls='sen-header-person' style={{ justifySelf: 'flex-end' }} />
		</>
	)
}
