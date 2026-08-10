import useInputStore from '@src/store/input'
import Item from './item'
import './style.css'

function Demo({ bldId }) {
	const demo = useInputStore((s) => s.input?.retain?.[bldId]?.demo)
	const isReady = demo?.cur === null && !!Object.keys(demo.checklist ?? {}).length
	return (
		<>
			{isReady ? (
				<div className='wh-container'>
					<ul className='wh-list'>
						{/* Список тестов */}
						{Object.entries(demo.checklist).map(([code, data], i) => (
							<Item key={code} data={data} />
						))}
					</ul>
				</div>
			) : (
				<div className='wh-container'>
					{typeof demo?.cur == 'number' ? 'Идет тестирование склада...' : 'Нет данных'}
				</div>
			)}
		</>
	)
}

export default Demo
