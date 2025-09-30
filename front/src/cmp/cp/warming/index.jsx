import useAuthStore from '@store/auth'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useEquipStore from '@store/equipment'
import Btn from '@cmp/fields/btn'
import './style.css'

export default function Warming({ cls }) {
	const { sect, build } = useParams()
	const isAuth = useAuthStore((s) => s.isAuth)
	const warming = useOutputStore(useShallow((s) => s.warming))
	const setWarming = useOutputStore(useShallow((s) => s.setWarming))
	const bar = useInputStore(useShallow((s) => s.alarm.bar))
	const resetId = useEquipStore(useShallow((s) => s.getSigByType(build, sect, 'reset')))
	const reset = useInputStore(useShallow((s) => s.getSignal(resetId)))
	const active = warming?.[build]?.[sect]
	const [cur, setCur] = useState('off')
	// Выход сброса аварии (реле безопасности)
	// const resetId = getSigByType(build, sect, 'reset')
	// const reset = getSignal(resetId)
	useEffect(() => {
		active ? setCur('on') : setCur('off')
	}, [active])
	// Авария низкой температуры (реле безопасности)
	const alrClosed = bar?.[build]?.[sect]?.alrClosed
	const obj = {
		buildingId: build,
		sectionId: sect,
	}
	if (!alrClosed && !reset && !warming?.[build]?.[sect]) return null

	let cl = ['warming', cls]
	cl = cl.join(' ')

	let clOn = ['nav-item']
	let clOff = ['nav-item']
	if (!isAuth) clOn.push('auth_bg')
	if (!isAuth) clOff.push('auth_bg')
	if (cur == 'off') clOff.push('active')
	if (cur == 'on') clOn.push('active')
	clOn = clOn.join(' ')
	clOff = clOff.join(' ')
	return (
		<div className={cl}>
			<span className='warming-span'>Прогрев клапанов</span>
			<Btn
				onClick={onWarming}
				cls={clOn}
				title={'Пуск'}
				style={isAuth || cur == 'on' ? {} : { color: 'var(--primary)' }}
			/>
			<Btn
				onClick={offWarming}
				cls={clOff}
				title={'Стоп'}
				style={isAuth || cur == 'off' ? {} : { color: 'var(--primary)' }}
			/>
		</div>
	)

	function onWarming() {
		if (!isAuth) return
		setCur('on')
		setWarming({ ...obj, cmd: true })
	}
	function offWarming() {
		if (!isAuth) return
		setCur('off')
		setWarming({ ...obj, cmd: false })
	}
}
