import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import useViewStore from '@src/store/view'
import AlarmBar from '@cmp/alarm_bar/mobile'
import Cp from '@cmp/cp'
import './style.css'

export default function Mobile() {
	const { sect, build } = useParams()
	const mb = useViewStore((s) => s.mb())
	// Тип склада
	const type = useEquipStore((s) => s.getType(build))
	const cls = ['page-section-sidebar-mobile', mb].join(' ')

	return (
		<>
			<div className={cls}>
				{/* Режим работы секции */}
				{/* {type !== 'cold' ? <Cp buildId={build} sect={sect} /> : null} */}
				{/* Аварии авторежима и таймер запретов */}
				<AlarmBar />
			</div>
		</>
	)
}
