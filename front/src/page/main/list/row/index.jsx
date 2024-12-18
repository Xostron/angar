import { Link } from 'react-router-dom'
import Mode from './fn/mode'
import Tprd from './fn/tprd'
import Alarm from './fn/alarm'
import Count from './fn/count'

export default function Row({ item, cls }) {
	const { _id, code, on } = item
	let cl = ['item', 'stix' + cls]
	cl = cl.join(' ')
	return (
		<Link className={cl} to={`/building/${_id}`}>
			<div className='top'>
				<p>{code}</p>
				<div className={`on onx${cls}`}>{on ? 'Вкл.' : 'Выкл.'}</div>
			</div>
			<Mode buildId={_id} cls={cls} />
			<Tprd buildId={_id} cls={cls} />
			<Alarm buildId={_id} cls={cls} />
			<Count buildId={_id} cls={cls} />
		</Link>
	)
}
