import { Link } from 'react-router-dom'
import Mode from './mode'
import Tout from './tout'
import Alarm from './alarm'
import { useShallow } from 'zustand/react/shallow'
import useInputStore from '@store/input'
import './style.css'


export default function Item({ item, idx, buildId}) {
	const [start] = useInputStore(useShallow(({ input }) => [input?.retain?.[buildId]?.start]))
	const { _id } = item
	let cl = ['item']
	if(!item?.on) cl.push('out')
	cl = cl.join(' ')
    

	return (
		<Link className={cl} to={`/building/${item._id}`}>
			<div>
				<div className='top'>
					<p>{item?.code}</p>
					<span className={start?'on':'off'}>{start ? 'Вкл.' : 'Выкл.'}</span>
				</div>
				<Mode buildingId={_id} type = {item?.type}/>
				<div className='bottom'>
					<Tout buildingId={_id} />
					<Alarm buildId={buildId}/>
				</div>
			</div>
		</Link>
	)
}
