import { useState } from 'react'
import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import useViewStore from '@src/store/view'
import AlarmBar from '@cmp/alarm_bar'
import Cp from './cp'

export default function Sidebar() {
	const { sect, build } = useParams()
	const mb = useViewStore((s) => s.mb())
	// скрыть/показать панель аварий
	const [active, setActive] = useState(false)
	const cp = active ? 'cp-hide' : ''
	const type = useEquipStore((s) => s.getType(build))
	const cls = ['page-section-mode', mb].join(' ')
	return (
		<div className={cls}>
			{/* <AlarmBar setActive={setActive} /> */}
			{type !== 'cold' ? <Cp buildId={build} sect={sect} cls={cp} /> : null}
		</div>
	)
}
