import './style.css'
import useInputStore from '@src/store/input'
import { useState } from 'react'

function Demo({ bldId }) {
	const demo = useInputStore((s) => s.input?.retain?.[bldId]?.demo)

	return (
		<>
			{demo?.cur === null ? (
				<div className='wh-container'>
					<ul className='wh-list'>
						{Object.entries(demo.checklist).map(([code, data], i) => (
							<Item key={code} code={code} data={data} />
						))}
					</ul>
				</div>
			) : (
				<div className='wh-container'>ТЕСТ ЕЩЕ НЕ ОКОНЧЕН</div>
			)}
		</>
	)
}

export default Demo

/**
 * type = passed | current | failed
 * @param {*} param0
 * @returns
 */
function Item({ code, data }) {
	const [open, setOpen] = useState(false)
	// console.log(11, code, data.list)

	const type = data.list.some((el) => el.list.length) ? 'failed' : 'passed'
	const hasSublist = !!data.list.length && type == 'failed'
	return (
		<li className={`wh-item ${open && hasSublist ? 'open' : ''}`} onClick={onClick}>
			<div className={`wh-item-base ${type}`}>
				{type == 'passed' ? (
					<span className='wh-status-icon'></span>
				) : (
					<span className={`wh-toggle-icon ${open ? 'open' : ''}`}></span>
				)}
				<div className='wh-content'>
					<span className='wh-title'>{data.name}</span>
					<span className='wh-desc'>Длительность теста {data.last}</span>
				</div>
				<div className='wh-badge'>{dict[type]}</div>
				{/* Дополнительный список раскрывается, если isOpen === true */}
			</div>
			{hasSublist && (
				<div className='wh-sub-list-wrapper'>
					<ul
						className={`wh-item-base ${type} open`}
						onClick={(e) => e.stopPropagation()}
					>
						{data.list.map((el, i) => (
							<li key={el.name + i} className={`wh-sub-item ${type}`}>
								<span>{el.name}</span>
								<ul>
									{el.list.map((err, idx) => (
										<li className='wh-sub-item-err' key={idx}>
											{err}
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			)}
		</li>
	)
	function onClick() {
		setOpen((v) => !v)
	}
}

const dict = {
	passed: 'выполнено',
	current: 'в процессе',
	failed: 'провалено',
}
