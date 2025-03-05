import { useEffect, useState } from 'react'
import Btn from '@cmp/fields/btn'
import Item from './item'
import './style.css'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
// Максимальное количество секций
const max = 6

// Пейджинг секций
export default function Paging({ bId, sects }) {
	let { sect, build } = useParams()
	const [page, setPage] = useState(0)
	const [arr, setArr] = useState(sects?.slice(0, max))
	const navigate = useNavigate()
	const location = useLocation()
	// Смена страниц
	useEffect(() => {
		const start = page * max
		const end = start + max
		setArr(sects?.slice(start, end))
	}, [page, sects])

	// useEffect(() => {
	// 	if (sects?.length === 1 && !sect) {
	// 		console.log(1111, build, 'Переход в секцию', sects, 'length = '+sects.length)
	// 		const path = `${location.pathname}/section/${sects?.[0]?._id}`.replace('//', '/')
	// 		navigate(path)
	// 		return
	// 	}
	// 	if (sects?.length>1) {
	// 		// const path = `${location.pathname}`.replace('//', '/')
	// 		navigate(-1)
	// 	}
	// }, [])

	if (!sects || sects?.length < 2) return null
	const limit = Math.ceil(sects?.length / max) - 1

	let cl = ['paging-children', `pcx${arr?.length}`]
	cl = cl.join(' ')

	return (
		<section className='sect'>
			<div className='paging'>
				{limit >= 1 && <Btn icon='\img\arrow-left.svg' cls='paging-arrow' onClick={prev} />}
				<article className={cl}>
					{arr?.length && arr.map((el, i) => <Item key={el._id} cls={arr?.length} sec={el} bId={bId} iSect={i} />)}
				</article>
				{limit >= 1 && <Btn icon='\img\arrow-right.svg' cls='paging-arrow' onClick={next} />}
			</div>
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
