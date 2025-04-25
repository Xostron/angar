import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'
import Cooler from './item'


export default function ListCooler({ cooler, cl = '', clCooler = '', clSensor = '' }) {
	const { build } = useParams()
	const input = useInputStore(({ input }) => input)
	const start = input?.retain?.[build]?.start

	return (
		<div className={cl}>
			{/* Испарители + Температура [] */}
			{!!cooler.length &&
				cooler?.map((el, i) => <Cooler key={i} state={el} data={input?.[el?._id]} start={start} cl={clCooler} clSensor={clSensor} />)}
		</div>
	)
}
