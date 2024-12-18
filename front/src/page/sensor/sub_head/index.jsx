import Turn from '@cmp/turn'
import Person from '@cmp/person'
import Title from './title'

export default function SubHead({ head, title }) {
	return (
		<>
			<Turn cls='sen-header-turn' />
			<div className='sen-header-sub'>
				<Title title={title} />
				<p>Состояние</p>
				<p>Коррекция</p>
				<p>Датчик</p>
				<p>Результат</p>
				<p>Ед.измерения</p>
			</div>
			<Person cls='sen-header-person' style={{justifySelf: 'flex-end'}}/>
		</>
	)
}
