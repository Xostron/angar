import Message from '@cmp/message'
import Person from '@cmp/person'
import Prod from '@cmp/prod'
import Turn from '@cmp/turn'
import useViewStore from '@store/view'
let stl = {
	gridArea: '1 / 2 / 2 / 3',
	display: 'flex',
	justifyContent: 'space-between',
}
//Позаголовок в странице склада
export default function SubHeader({}) {
	const mb = useViewStore((s) => s.mb())

	return !mb ? (
		// desktop
		<>
			<Turn style={{ gridArea: '1 / 1 / 1 / 1' }} />
			<Person style={{ gridArea: '1 / 3 / 1 / 3', justifySelf: 'end' }} />
			<div style={stl}>
				<Prod />
				<Message />
			</div>
		</>
	) : (
		// mobile
		<section className={'cmp-subheader-mb'} style={{ gridArea: '1 / 1 / 3 / 1' }}>
			<div>
				<Turn />
				<Person />
			</div>
			<div>
				<Prod />
				<Message />
			</div>
		</section>
	)
}
