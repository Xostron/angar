import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import Agregat from './agregat'
import Pressure from '../pressure'
import Condens from '../condens'

export default function Aggregate({}) {
	const [build] = useEquipStore(({ build }) => [build()])
	const input = useInputStore(({ input }) => input)

	const { pin, pout } = input?.total?.[build?._id] ?? {}
	const aggregates = build?.aggregate ?? []
	let condenser = aggregates.map((el) => el.condenser).flat()

	return (
		<div className='row1'>
			<Pressure data={pin} state={build?.pin} />
			{aggregates.length ? aggregates.map((el, i) => <Agregat key={i} state={el} data={input?.[el?._id]} />) : null}
			<Pressure data={pout} state={build?.pout} />
			{condenser.length ? condenser.map((el, i) => <Condens key={i} state={el} data={input?.[el?.aggregateListId]} />) : null}
		</div>
	)
}
