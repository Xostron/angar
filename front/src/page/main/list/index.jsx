import { useEffect, useMemo, useState } from 'react'
import useViewStore from '@store/view'
// import ItemOld from './item_old'
import Item from './item'
import Btn from '@cmp/fields/btn'
import useEquipStore from '@store/equipment'
import './style.css'

export default function List({ list }) {
	const [page, setPage] = useState(0)
	const remoteRaw = useEquipStore((s) => s.remote)
	const remote = useMemo(() => {
		const items = []
		;(remoteRaw ?? []).forEach((el) => {
			items.push(
				...el.buildings.map((e) => ({
					...e,
					deviceId: el._id,
					ord: el.order,
					remote: true,
				})),
			)
		})
		items.sort((a, b) => {
			if (a.ord !== b.ord) return a.ord - b.ord
			return a.order - b.order
		})
		return items
	}, [remoteRaw])
	const fullList = useMemo(() => [...list, ...remote], [list, remote])
	const [arr, setArr] = useState(fullList?.slice(0, 10))
	const mb = useViewStore((s) => s.mb())
	const limit = Math.ceil(fullList?.length / 10) - 1

	// Пейджирование
	useEffect(
		(_) => {
			const start = page * 10
			const end = start + 10
			setArr(fullList?.slice(start, end))
		},
		[page, fullList],
	)

	if (!fullList?.length) return null
	let cl = ['store-wrapper'].join(' ')
	let clList = ['list', mb, `count-${fullList.length}`].join(' ')
	return (
		<div className={cl}>
			{/* left */}
			{limit >= 1 && <Btn icon='\img\arrow-left.svg' cls='btn-arrow l' onClick={prev} />}
			{/* Список складов */}
			<div className={clList}>
				{arr.map((el, i) =>(<Item key={el._id} item={el} idx={i} buildId={el._id} />))}
				{/* {arr.map((el, i) =>
					el.remote ? (
						<Item key={el._id} item={el} idx={i} buildId={el._id} />
					) : (
						<ItemOld key={el._id} item={el} idx={i} cls={arr.length} buildId={el._id} />
					),
				)} */}
			</div>
			{/* right */}
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
