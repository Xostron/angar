import Message from '@cmp/message'
import Person from '@cmp/person'
import Prod from '@cmp/prod'
import Turn from '@cmp/turn'
import './style.css'

// mobile
//Позаголовок в странице склада
export default function SubHeader({}) {
	return (
		<section className='cmp-subheader-mb'>
			<div className='cmp-subheader-mb-row'>
				<Turn />
				<Person />
			</div>
			<div className='cmp-subheader-mb-row'>
				<Prod />
			</div>
			<div className='cmp-subheader-mb-row'>
				<Message />
			</div>
		</section>
	)
}
