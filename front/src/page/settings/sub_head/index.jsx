import Person from '@cmp/person'
import Turn from '@cmp/turn'
import Title from './title'
//Подзаголовок настроек с шапкой таблицы настроек
export default function SubHead({ head, title, st, warn }) {
	const col = head.length + 3
	return (
		<>
			<Turn style={{ gridArea: '1/1/1/1' }} />
			<Title title={title} head={head} st={st} warn={warn} />
			<Person style={{ gridArea: `1/${col}/1/${col + 1}`, justifySelf: 'flex-end' }} />
		</>
	)
}
