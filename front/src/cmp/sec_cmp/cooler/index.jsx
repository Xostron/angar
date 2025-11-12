import { useParams } from 'react-router-dom'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import Cooler from './item'

export default function ListCooler({}) {
	const { build } = useParams()
	const input = useInputStore(({ input }) => input)
	const start = input?.retain?.[build]?.start
	const { cooler } = useEquipStore(({ section }) => section())
	let cls = ['row-cooler']
	cls = cls.join(' ')
	return (
		<div className={cls}>
			{/* Испарители + Температура [] */}
			{!!cooler.length &&
				cooler?.map((el, i) => (
					<Cooler key={i} state={el} data={input?.[el?._id]} start={start} />
				))}
		</div>
	)
}
