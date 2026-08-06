import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import Mode from './mode'
import Tout from './tout'
import useViewStore from '@store/view'
import useInputStore from '@store/input'
import useRemoteStore from '@store/remote'
// import useDialog from '@cmp/dialog/hook'
import './style.css'
import Remote from './remote';

export default function Item({ item }) {
	const remoteBCard = useRemoteStore(useShallow((s) => {
		if (!item.remote) return null
		const b = s.buildings?.[item.bldId]
		if (!b) return null
		return { ...b, device: s.devices?.[b.deviceId] }
	}))
	const inputBCard = useStoreWithEqualityFn(useInputStore, (s) => item.remote ? null : s.input?.bCard?.[item._id] ?? null, (a, b) => JSON.stringify(a) === JSON.stringify(b))
	const doc = item.remote ? remoteBCard : inputBCard
	const mb = useViewStore((s) => s.mb())
	let cl = ['item']
	if (mb) cl.push(mb)
	cl = cl.join(' ')

	if (item.remote) return <Remote cl={cl} doc={doc} item={item} />
	return (
		<Link className={cl} to={`/building/${item._id}`}>
			<div>
				<div className='top'>
					<p>
						{doc?.code} {doc?.name}
					</p>
						<span className={doc?.sidesect?.start ? 'on' : 'off'}>{doc?.sidesect?.start ? 'Вкл.' : 'Выкл.'}</span>
				</div>
				<Mode doc={doc} />
					<div className='bottom'>
						<Tout doc={doc} />
					</div>
			</div>
		</Link>
	)
}
