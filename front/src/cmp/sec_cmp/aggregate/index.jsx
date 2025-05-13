import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import Agregat from './agregat'
import Pressure from '../pressure'
import Condens from '../condens'

/**
 *
 * @param {object[]} агрегаты
 * @returns
 */
export default function Aggregate({ data = null }) {
	const [build, section] = useEquipStore(({ build, section }) => [build(), section()])
	const input = useInputStore(({ input }) => input)
	// Список агрегатов: агрегаты привязанные к испарителю(секции)
	const coolers = data ?? []
	return (
		<div className='row1'>
			{!!coolers.length &&
				coolers.map((el, i) => {
					const pin = input?.total?.[el?.sectionId]?.cooler?.[el?._id]?.pin
					const pout = input?.total?.[el?.sectionId]?.cooler?.[el?._id]?.pout
					return (
						<div className='cmp-sec-aggregate' key={el._id}>
							<Pressure data={pin} state={build?.pin || section?.pin} />
							<Agregat key={i} state={el} data={input?.[el?._id]} />
							<Pressure data={pout} state={build?.pout || section?.pout} />
							{!!el.aggregate.condenser.length &&
								el.aggregate.condenser.map((cn, i) => <Condens key={i} state={cn} data={input?.[el?.aggregateListId]} />)}
						</div>
					)
				})}
		</div>
	)
}

// function sensorP(aggSect, dataB, dataS, input) {
// 	// Если агрегат не привязан к секции, то датчики давления от склада
// 	if (!aggSect) {
// 		const { pin, pout } = input?.total?.[build?._id] ?? {}
// 		return { pin, pout }
// 	}
// 	// Агрегат привязан к секции датчики давления от испарителя (секции)

// 	return { pin, pout }
// }
