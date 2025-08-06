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
	const idB = data?.build
	const { clear } = useWarn(({ clear }) => ({ clear }))
	const [prdList, bType] = useEquipStore(({ prdList, build }) => [prdList(idB), build()?.type])
	const [automode, start, product] = useInputStore(({ input }) => [
		input?.retain?.[idB]?.automode,
		input?.retain?.[idB]?.start,
		input?.retain?.[idB]?.product,
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
				{bType != 'cold' && (
					<Line name='' type='automode' data={am} setData={actAutomode} list={aAm} />
				)}
				<Line name='' type='product' data={pr} setData={actProduct} list={aProd} />
			</span>
			<Data prd={product?.code} />
			<Footer name={bStart} act1={action} act2={clear} act3={zero} />
		</div>
	)
	// Кнопка Вкл/выкл склад
	function action() {
		setStart({ _id: idB, val: !start })
		clear()
	}
	// Кнопка выбрать product
	function actProduct(val) {
		const prod = prdList?.find((el) => el.code === val)
		setPr(val)
		sProduct({ buildingId: idB, ...prod })
	}
	// Кнопка выбрать режим автоуправления
	function actAutomode(val) {
		setAutomode({ _id: idB, val: val })
		setAm(val)
	}

	// Кнопка Обнулить
	function zero() {
		sZero({ buildingId: idB })
	}
}
