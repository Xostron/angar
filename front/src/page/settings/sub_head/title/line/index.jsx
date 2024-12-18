import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useOutputStore from '@store/output'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'
import Choise from '@cmp/fields/choise'
import defImg from '@tool/icon'

function Line({ name, type, action }) {
	const { build } = useParams()
	// Текущий продукт склада
	const [product] = useInputStore(({ input }) => [input?.retain?.[build]?.product])
	// Выбранный продукт
	const [prd, setPrd, setSettingAu] = useOutputStore(({ prd, setPrd, setSettingAu }) => [prd, setPrd, setSettingAu])
	// Список продуктов
	const [prdList] = useEquipStore(({ prdList }) => [prdList(build)])

	const list = prdList.map((el) => ({
		title: el.name,
		code: defImg.product[el?.code]?.code,
		img: defImg.product[el?.code]?.img,
	}))

	useEffect(() => {
		setPrd(product)
	}, [product?.name])
	
	const img = defImg?.[type]?.[prd?.code]?.img ? <img src={defImg?.[type]?.[prd?.code]?.img} /> : null
	const title =  defImg?.[type]?.[prd?.code]?.title ?? '--'
	return (
		<div className='line'>
			<p>{name}</p>
			<Choise data={prd?.name} setData={setData} list={list} style={{}} />
			<div className='line2'>
				{img}
				<p>{title}</p>
			</div>
		</div>
	)

	// Кнопка выбрать product
	function setData(code) {
		name = defImg?.[type]?.[code]?.title
		const p = prdList.find((el) => el?.name == name)
		setPrd(p)

		setSettingAu(null)
		action()
	}
}

export default Line
