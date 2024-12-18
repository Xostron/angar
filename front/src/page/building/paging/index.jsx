import { useEffect, useState } from 'react'
import Btn from '@cmp/fields/btn'
import Item from './item'
import './style.css'

// Пейджинг секций
export default function Paging({ bId, sections }) {
	// Максимальное количество секций
	const max = 6
	const [page, setPage] = useState(0)
	const [arr, setArr] = useState(sections?.slice(0, max))
	const limit = Math.ceil(sections.length / max) - 1

	// смена страниц
	useEffect(() => {
		const start = page * max
		const end = start + max
		setArr(sections?.slice(start, end))
	}, [page, sections])

	if (!sections) return null

	let cl = ['paging-children', `pcx${arr.length}`]
	cl = cl.join(' ')

	return (
		<section className='paging'>
			{limit >= 1 && <Btn icon='\img\arrow-left.svg' cls='paging-arrow' onClick={prev} />}
			<article className={cl}>
				{arr?.length &&
					arr.map((el, i) => <Item key={i} cls={arr.length} sec={el} bId={bId} iSect={i} />)}
			</article>
			{limit >= 1 && <Btn icon='\img\arrow-right.svg' cls='paging-arrow' onClick={next} />}
		</section>
	)
	// Следующая страница
	function next() {
		if (page >= limit) return setPage((pr) => (pr = 0))
		setPage((pr) => ++pr)
	}
	// Предыдущая страница
	function prev() {
		if (page <= 0) return setPage((pr) => (pr = limit))
		setPage((pr) => --pr)
	}
}
