import Message from '@cmp/message'
import Person from '@cmp/person'
import Prod from '@cmp/prod'
import Turn from '@cmp/turn'

const stlProd = {
	gridArea: '1 / 2 / 2 / 3',
	display: 'flex',
	justifyContent: 'space-between',
}
const stlTurn = { gridArea: '1 / 1 / 1 / 1' }
const stlPerson = { gridArea: '1 / 3 / 1 / 3', justifySelf: 'end' }
// desktop
//Позаголовок в странице склада
export default function SubHeader({}) {
	return (
		<>
			<Turn style={stlTurn} />
			<Person style={stlPerson} />
			<div style={stlProd}>
				<Prod />
				<Message />
			</div>
		</>
	)
}
