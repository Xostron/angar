import { useState } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import useViewStore from '@src/store/view'
import AlarmBar from './alarm_bar'
import Cp from '../cp'
import './style.css'

export default function Mobile() {
	const { sect, build } = useParams()
	const mb = useViewStore((s) => s.mb())

	const type = useEquipStore((s) => s.getType(build))
	const cls = ['page-section-sidebar-mobile', mb].join(' ')

	return (
		<>
			<div className={cls}>
				{type !== 'cold' ? <Cp buildId={build} sect={sect} /> : null}
				<AlarmBar />
			</div>
		</>
	)
}
