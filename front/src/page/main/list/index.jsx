import { useEffect, useState } from 'react'
import Item from './item'
import Btn from '@cmp/fields/btn'
import './style.css'

export default function List({ list }) {
	const [page, setPage] = useState(0)
	const [arr, setArr] = useState(list?.slice(0, 10))

	const limit = Math.ceil(list?.length / 10) - 1

	// Пейджирование
	useEffect(
		(_) => {
			const start = page * 10
			const end = start + 10
			setArr(list?.slice(start, end))
		},
		[page, list]
	)

	if (!list?.length) return null
	let cl = ['store-wrapper'].join(' ')
	let clList = ['list', `count-${list.length}`].join(' ')

	return (
		<div className={cl}>
			{limit >= 1 && <Btn icon='\img\arrow-left.svg' cls='btn-arrow l' onClick={prev} />}
			<div className={clList}>
				{arr.map((el, i) => (
					<Item key={i} item={el} idx={i} cls={arr.length} buildId={el._id} />
				))}
			</div>
			{limit >= 1 && <Btn icon='\img\arrow-right.svg' cls='btn-arrow r' onClick={next} />}
		</div>
	)

	function next() {
		if (page >= limit) return setPage(0)
		setPage(page + 1)
	}

	function prev() {
		if (page <= 0) return setPage(limit)
		setPage(page - 1)
	}
}
