import { useEffect, useState } from 'react'
import useEquipStore from '@store/equipment'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import { sProduct, sZero } from '@socket/emit'
import defImg from '@tool/icon'
import Data from './data'
import Line from './line'
import Title from './title'
import Footer from './footer/inde'
import './style.css'

// Модальное окно: вкл/выкл склад
export default function Entry({ data, entryCode }) {
	const { build } = data
	const { clear } = useWarn(({ clear }) => ({ clear }))
	const [prdList] = useEquipStore(({ prdList }) => [prdList(build)])
	const [automode, start, product] = useInputStore(({ input }) => [
		input?.retain?.[build]?.automode,
		input?.retain?.[build]?.start,
		input?.retain?.[build]?.product,
	])
	const { setStart, setAutomode } = useOutputStore()

	const bStart = start ? 'Выкл.' : 'Вкл.'
	// Текущий режим
	const [am, setAm] = useState(automode)
	// Текущий продукт
	const [pr, setPr] = useState(product?.code ?? null)

	useEffect(() => {
		setAm(automode)
	}, [automode])

	useEffect(() => {
		setPr(product?.code)
	}, [product?.code])

	// Список продуктов
	const aProd = prdList?.map((el) => ({
		title: el.name,
		code: defImg.product[el?.code]?.code,
		img: defImg.product[el?.code]?.img,
	}))
	// Список режимов
	const aAm = Object.values(defImg.automode)
	return (
		<div className='entry'>
			<Title />
			<span className='line3'>
				<Line name='' type='automode' data={am} setData={actAutomode} list={aAm} />
				<Line name='' type='product' data={pr} setData={actProduct} list={aProd} />
			</span>
			<Data prd={product?.code}/>
			<Footer name={bStart} act1={action} act2={clear} act3={zero} />
		</div>
	)

	// Кнопка Вкл/выкл склад
	function action() {
		setStart({ _id: build, val: !start })
		clear()
	}
	// Кнопка выбрать product
	function actProduct(val) {
		const prod = prdList?.find((el) => el.code === val)
		setPr(val)
		sProduct({ buildingId: build, ...prod })
	}
	// Кнопка выбрать режим автоуправления
	function actAutomode(val) {
		setAutomode({ _id: build, val: val })
		setAm(val)
	}
	
	// Кнопка Обнулить
	function zero() {
		sZero({ buildingId: build })
		// close()
	}
}
