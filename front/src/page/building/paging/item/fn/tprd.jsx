import useInputStore from '@store/input'
import Sens from './sens'

// Мин, макс температура продукта по секции
export default function Tprd({ sId }) {
	const d = [
		{ name: 'min', type: 'temp' },
		{ name: 'max', type: 'temp' },
	]
	const [getTotalBy] = useInputStore(({ getTotalBy }) => [getTotalBy])
	d[0] = { ...d[0], ...getTotalBy('tprd', 'min', sId) }
	d[1] = { ...d[1], ...getTotalBy('tprd', 'max', sId) }

	return <div className='section-sens'>{!!d?.length && d.map((el, i) => <Sens key={i} data={el} />)}</div>
}
