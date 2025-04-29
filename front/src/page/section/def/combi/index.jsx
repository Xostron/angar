import { useParams } from 'react-router-dom'
import Other from '@cmp/sec_cmp/other'
import RowTemp from '@cmp/sec_cmp/row/row_temp'
import RowFan from '@cmp/sec_cmp/row/row_fan'
import useEquipStore from '@store/equipment'
import running from '@tool/status/build_section'
import Aggregate from '@cmp/sec_cmp/aggregate'
import '../style.css'

//Подробная информация по секции - Комбинированный склад
export default function Combi() {
	const { build, sect } = useParams()
	const { tprd, tcnl, fan, valve, heating, p, cooler } = useEquipStore(({ section }) => section())
	const { isMan } = running(build, sect)
	const r3 = [...tcnl, ...p]
	return (
		<section className='sect cold combi'>
			{/* Агрегаты и давление */}
			<Aggregate />
			{/* Температура продукта */}
			<RowTemp data={tprd} />
			{/* Напорные вентиляторы */}
			<RowFan active={isMan} fan={fan} cooler={cooler} />
			{/* Температура канала (смешения) */}
			<RowTemp data={r3} />
			{/* Клапан, обогреватель */}
			<Other active={isMan} data={{ valve, heating }} />
		</section>
	)
}
