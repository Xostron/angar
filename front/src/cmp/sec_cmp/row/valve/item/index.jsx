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
	// Текущее положение группы клапанов
	const spp = valve?.valve?.map((el) => input?.[el._id]?.val)


	const sp = valve?.value
	const state = valve?.state
	const type = valve.type === 'out' ? 'vout' : 'vin'

	const imgV = defImg.valve?.[type]?.[state]
	let cl = ['sio-btn']

	if (isAuth && active) cl.push('man')
	if (state === 'alr') cl.push('alarm')
	// if (!cl.includes('auth') && !cl.includes('alarm')) cl.push('man')
	cl = cl.join(' ')

	return (
		<div className='sio-valve'>
			{valve.type === 'out' ? (
				<span style={{ textAlign: 'left' }} title={spp.join(' : ')}>
					{sp} %
				</span>
			) : (
				<></>
			)}
			<Btn
				icon={imgV}
				cls={cl}
				onClick={() =>
					onClick({
						valve,
						type: 'valve',
						state,
						build,
						sp,
					})
				}
			/>
			{valve.type === 'in' ? (
				<span style={{ textAlign: 'right' }} title={spp.join(' : ')}>
					{sp} %
				</span>
			) : (
				<></>
			)}
		</div>
	)
}
