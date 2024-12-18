import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Cp from './cp'
import AlarmBar from '@cmp/alarm_bar'
import useEquipStore from '@store/equipment'

export default function Sidebar() {
	const { sect, build } = useParams()
	// скрыть/показать панель аварий
	const [active, setActive] = useState(false)
	const cp = active ? 'cp-hide' : ''
	const type = useEquipStore(
		({ getType }) => getType(build)
	)	

	return (
		<div className='panel'>
			<AlarmBar setActive={setActive} />
			{type !== 'cold'
				? <Cp buildId={build} sect={sect} cls={cp} />
				: null
			}
			
		</div>
	)
}
