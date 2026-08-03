import './style.css'
import useInputStore from '@src/store/input'

function Demo({ bldId }) {
	const demo = useInputStore((s) => s.input?.retain?.[bldId]?.demo)

	// console.log(11, demo)
	return (
		<div className='wh-container'>
			<ul className='wh-list'>
				{Object.entries(demo.checklist).map(([code, data], i) => (
					<Item key={code} code={code} data={data} />
				))}
			</ul>
		</div>
	)
}

export default Demo

/**
 * type = passed | current | failed
 * @param {*} param0
 * @returns
 */
function Item({ code, data }) {
	// Исполнит механизмы
	const m = Object.values(data)
	// [][]string - аварии по исполнительным мех-мам
	const elm = m.map((el) => Object.values(el))
	// Есть аварии = failed
	const type = elm.some((el) => el.length) ? 'failed':'passed'
	return (
		<li className={`wh-item ${type}`}>
			<span className='wh-status-icon'></span>
			<div className='wh-content'>
				<div className='wh-title'>Название теста {code}</div>
				{/* <div className='wh-desc'>Длительность</div> */}
			</div>
			<div className='wh-badge'>{dict[type]}</div>
		</li>
	)
}

const dict = {
	passed: 'выполнено',
	current: 'в процессе',
	failed: 'провалено',
}
