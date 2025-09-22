import { useParams } from 'react-router-dom'
import RowValve from '@src/cmp/sec_cmp/row/valve'
import RowTemp from '@src/cmp/sec_cmp/row/temp'
import RowFan from '@src/cmp/sec_cmp/row/fan'
import useEquipStore from '@store/equipment'
import running from '@tool/status/build_section'
import Aggregate from '@cmp/sec_cmp/aggregate'
import '../style.css'
import useViewStore from '@src/store/view'

/**
 * @description Подробная информация по секции - Комбинированный склад
 *
 *
 * @returns
 */
export default function Combi() {
	const { build, sect } = useParams()
	const [{ tprd, tcnl, fan, valve, heating, p, cooler }] = useEquipStore(({ section }) => [
		section(),
	])
	// Ручной режим активен
	const { isMan } = running(build, sect)
	const r3 = [...tcnl, ...p]
	const mb = useViewStore((s) => s.mb())
	const cls = ['sect', mb, 'cold combi'].join(' ')
	return (
		<section className={cls}>
			{/* Агрегаты и давление */}
			<Aggregate data={cooler} />
			{/* Температура продукта */}
			<RowTemp data={[...tprd]} />
			{/* Напорные вентиляторы */}
			<RowFan active={isMan} fan={fan} cooler={cooler} />
			{/* Температура канала (смешения) */}
			<RowTemp data={r3} />
			{/* Клапан, обогреватель */}
			<RowValve active={isMan} data={{ valve, heating }} />
		</section>
	)
}
