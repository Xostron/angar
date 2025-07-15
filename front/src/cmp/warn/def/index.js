import person from './person'
import turn from './turn'
import warn from './warn'

export default {
	person,
	turn,
	warn,
	notfound: ({ data, entryCode }) => (
		<div className='entry'>Модального окна {entryCode} не существует</div>
	),
}
