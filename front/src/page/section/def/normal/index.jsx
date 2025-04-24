import { useParams } from 'react-router-dom'
import Other from '@cmp/sec_cmp/other'
import RowTemp from '@cmp/sec_cmp/row/row_temp'
import RowFan from '@cmp/sec_cmp/row/row_fan'
import useEquipStore from '@store/equipment'
import running from '@tool/status/build_section'

//Подробная информация по секции - Обычный склад
export default function Normal() {
	const { build, sect } = useParams()
	const { tprd, tcnl, fan, valve, heating, p } = useEquipStore(({ section }) => section())
	const { isMan } = running(build, sect)
	const r3 = p?.length < 3 ? [...tcnl, ...p] : tcnl
	return (
		<section className='sect'>
			{/* Температура продукта */}
			<RowTemp data={tprd} />
			{/* Напорные вентиляторы */}
			<RowFan active={isMan} data={fan} />
			{/* Температура канала (смешения) */}
			<RowTemp data={r3} />
			{p?.length > 2 && <RowTemp data={p} />}
			{/* Клапан, обогреватель */}
			<Other active={isMan} data={{ valve, heating }} />
		</section>
	)
}
