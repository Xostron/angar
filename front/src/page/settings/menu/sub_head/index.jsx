import Person from '@cmp/person'
import Prod from '@cmp/prod'
import Turn from '@cmp/turn'

//Подзаголовок у настроек
export default function SubHead({}) {
	return (
		<>
			<Turn style={{ gridArea: '1 / 1 / 1 / 1' }} />
			<Prod style={{ gridArea: '1 / 2 / 1 / 2' }}  />
			<Person style={{ gridArea: '1 / 3 / 1 / 3', justifySelf: 'flex-end' }} />
		</>
	)
}
