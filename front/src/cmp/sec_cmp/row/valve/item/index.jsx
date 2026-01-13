import { useParams } from 'react-router-dom'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import Btn from '@cmp/fields/btn'
import defImg from '@src/tool/icon'
import Valve from './valve'
import '../style.css'

export default function Valve({ valve, onClick, active }) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const { build } = useParams()
	const [input] = useInputStore(({ input }) => [input])
	// Калибровочное время клапанов (время поткрытия)
	const refSp = input?.retain?.[build]?.valve?.[valve?._id] || 1
	const sp = input?.[valve?._id]?.val
	const state = input?.[valve?._id]?.state
	const type = valve.type === 'out' ? 'vout' : 'vin'
	const imgV = defImg.valve?.[type]?.[state]
	let cl = ['sio-btn']
	console.log(1, state)

	if (isAuth && active) cl.push('man')
	if (state === 'alr') cl.push('alarm')
	// if (!cl.includes('auth') && !cl.includes('alarm')) cl.push('man')
	cl = cl.join(' ')
	return (
		<div className='sio-valve'>
			{valve.type === 'out' ? <span style={{ textAlign: 'left' }}>{sp} %</span> : <></>}
			<Btn
				icon={imgV}
				cls={cl}
				onClick={() =>
					onClick({
						vlv: valve,
						type: 'valve',
						state,
						build,
						refSp,
						sp,
					})
				}
			/>
			{valve.type === 'in' ? <span style={{ textAlign: 'right' }}>{sp} %</span> : <></>}
		</div>
	)
}
