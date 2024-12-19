import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import Pressure from './pressure'
import Agregat from './aggregate'

import Cooler from './cooler'
import Condens from './condens'
import './style.css'
import CO2 from './co2'
import Wetting from './wetting'
import Tprd from './tprd'
//Подробная информация по секции

export default function Cold() {
	const [section, build] = useEquipStore(({ section, build }) => [section(), build()])
	const input = useInputStore(({ input }) => input)

	const { pin, pout } = input?.total?.[build?._id] ?? {}
	const { co2, wetting, ozon } = input?.total?.[section?._id]?.device ?? {}
	const aggregates = build?.aggregate ?? []
	let condenser = aggregates.map((el) => el.condenser).flat()
	const { tprd, cooler } = section
	const start = input?.retain?.[build?._id]?.start

	return (
		<section className='sect cold'>
			<div className='row1'>
				<Pressure data={pin} state={build?.pin}/>
				{aggregates.length
					? aggregates.map((el, i)=><Agregat key={i} state={el} data={input?.[el?._id]}/>)
					: null}
				<Pressure data={pout} state={build?.pout}/>

				{condenser.length
					? condenser.map((el, i)=><Condens key={i} state={el} data={input?.[el?.aggregateListId]}/>)
					: null}
			</div>

			<div className='row2'>
				<div className='top'>
						{/* Испарители + Температура [] */}
					{cooler.length
						?cooler?.map((el, i)=><Cooler key={i} state={el} data={input?.[el?._id]} start={start}/>)
						:null
					}
				<CO2 data={co2}/>
				<Wetting data={wetting}/>
				</div>
				<Tprd data={tprd} input={input}/>
			</div>
		</section>
	)
}
