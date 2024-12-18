import Message from '@cmp/message'
import Person from '@cmp/person'
import Prod from '@cmp/prod'
import Turn from '@cmp/turn'

//Позаголовок в странице склада
export default function SubHeader({}) {
	return (
		<>
			<Turn style={{ gridArea: '1 / 1 / 1 / 1' }} />
			<div style={{ gridArea: '1 / 2 / 2 / 3', display: 'flex', justifyContent: 'space-between' }}>
				<Prod />
				<Message />
			</div>
			<Person style={{ gridArea: '1 / 3 / 1 / 3', justifySelf:'end' }} />
		</>
	)
}
