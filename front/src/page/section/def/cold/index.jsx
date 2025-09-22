import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import Aggregate from '@cmp/sec_cmp/aggregate'
import Wetting from '@cmp/sec_cmp/wetting'
import ListCooler from '@cmp/sec_cmp/cooler'
import Tprd from '@cmp/sec_cmp/tprd'
import CO2 from '@cmp/sec_cmp/co2'
import useViewStore from '@src/store/view'
import '../style.css'

//Подробная информация по секции - Холодильник
export default function Cold() {
	const [section] = useEquipStore(({ section }) => [section()])
	const input = useInputStore(({ input }) => input)

	const { co2, wetting, ozon } = input?.total?.[section?._id]?.device ?? {}
	const { tprd, cooler } = section
	const mb = useViewStore((s) => s.mb())
	const cls = ['sect', mb, 'cold'].join(' ')
	return (
		<section className={cls}>
			<Aggregate data={cooler} />
			<div className='row2'>
				<div className='top'>
					<ListCooler />
					<CO2 data={co2} />
					<Wetting data={wetting} />
				</div>
				<Tprd data={tprd} input={input} />
			</div>
		</section>
	)
}
