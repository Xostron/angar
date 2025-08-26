import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import defImg from '@src/tool/icon'
import Item from './item'
import './style.css'

export default function RowValve({ active, data }) {
	const { heating = [], valve = [] } = data
	const isAuth = useAuthStore((s) => s.isAuth)
	const input = useInputStore((s) => s.input)
	const warnCustom = useWarn((s) => s.warnCustom)

	if (!valve && !heating) return null

	const vin = valve?.filter((v) => v.type === 'in')
	const vout = valve?.filter((v) => v.type === 'out')
	if (!vin) return null
	// Состояние обогревателя
	const stateH = input?.outputEq?.[heating?.[0]?._id] == 1 ? 'on' : 'off'
	const imgH = defImg.heating?.[stateH]

	let cls = ['section-info-other']
	cls = cls.join(' ')
	return (
		<>
			<div className={cls}>
				<div className='sio-valve-map' style={{ alignItems: 'start' }}>
					{vin.map((el, i) => (
						<Item key={i} valve={el} onClick={onClick} active={active} />
					))}
				</div>

				<span style={{ textAlign: 'start' }}>
					Приточный <br /> клапан
				</span>

				<div className={cls}>{stateH === 'on' && <img src={imgH} />}</div>

				<span style={{ textAlign: 'end' }}>
					Выпускной <br /> клапан
				</span>

				<div className='sio-valve-map' style={{ alignItems: 'end' }}>
					{vout.map((el, i) => (
						<Item key={i} valve={el} onClick={onClick} active={active} />
					))}
				</div>
			</div>
		</>
	)

	function onClick(obj) {
		if (!isAuth || !active) return
		warnCustom(obj, 'valve')
	}
}
