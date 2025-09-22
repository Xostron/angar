import { useParams } from 'react-router-dom'
import RowValve from '@src/cmp/sec_cmp/row/valve'
import RowTemp from '@src/cmp/sec_cmp/row/temp'
import RowFan from '@src/cmp/sec_cmp/row/fan'
import useEquipStore from '@store/equipment'
import running from '@tool/status/build_section'
import useViewStore from '@src/store/view'

//Подробная информация по секции - Обычный склад
export default function Normal() {
	const { build, sect } = useParams()
	const { tprd, tcnl = [], fan, valve, heating, p } = useEquipStore(({ section }) => section())
	const binding = useEquipStore(({ build }) => build()?.binding)
	const { isMan } = running(build, sect)
	const r3 = p?.length < 3 ? [...(tcnl ?? []), ...p] : tcnl
	const fans = fan
		.map((el) => {
			const b = binding?.find((el) => el.owner.id == el._id)
			return b ? { ...el, ao: { id: b.moduleId, channel: b.channel } } : el
		})
		.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
	const mb = useViewStore((s) => s.mb())
	const cls = ['sect', mb].join(' ')
	return (
		<section className={cls}>
			{/* Температура продукта */}
			<RowTemp data={tprd} />
			{/* Напорные вентиляторы */}
			<RowFan active={isMan} fan={fans} />
			{/* Температура канала (смешения) */}
			<RowTemp data={r3} />
			{p?.length > 2 && <RowTemp data={p} />}
			{/* Клапан, обогреватель */}
			<RowValve active={isMan} data={{ valve, heating }} />
		</section>
	)
}
