const dict = {
	passed: 'выполнено',
	current: 'в процессе',
	failed: 'провалено',
}

/**
 * Карточка теста
 * @param {*} param0
 * @returns
 */
function CardTest({ data, type, open }) {
	const State =
		type == 'passed' ? (
			// Пройден
			<span className='wh-status-icon'></span>
		) : (
			// Провален
			<span className={`wh-toggle-icon ${open ? 'open' : ''}`}></span>
		)
	return (
		<div className={`wh-item-base ${type}`}>
			{State}
			<div className='wh-content'>
				<span className='wh-title'>{data.name}</span>
				<span className='wh-desc'>Длительность теста {data.last}</span>
			</div>
			<div className='wh-badge'>{dict[type]}</div>
		</div>
	)
}

/**
 * Список исполнительных механизмов
 * @param {*} param0
 * @returns
 */
function Sublist({ data, type, has }) {
	if (!has) return
	return (
		<div className='wh-sub-list-wrapper'>
			<ul className={`wh-item-base ${type} open`} onClick={(e) => e.stopPropagation()}>
				{data.list.map((el, i) => (
					<li key={el.name + i} className={`wh-sub-item ${type}`}>
						<span>{el.name}</span>
						<Errlist el={el} />
					</li>
				))}
			</ul>
		</div>
	)
}

/**
 * Список аварий возникших на данном исполнительном механизме
 * @param {*} param0
 * @returns
 */
function Errlist({ el }) {
	return (
		<ul>
			{el.list.map((err, idx) => (
				<li key={idx} className='wh-sub-item-err'>
					{err}
				</li>
			))}
		</ul>
	)
}

export { CardTest, Sublist, Errlist }
