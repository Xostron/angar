import { useState, useEffect } from 'react'
import './style.css'
import Btn from '@src/cmp/fields/btn'
import Input from '@src/cmp/fields/input'
// чек-бокс - управление вентилятором
/**
 *
 * @param {*} active В ручном режиме
 * @param {*} state Состояние вентилятора
 * @param {*} sel Выбранная радиокнопка
 * @param {*} change Переключение радиокнопок
 * @returns
 */
export default function Field({ data }) {
	const { title, obj, moreValue, setSettingAu, sendSettingAu, fnNo, fnYes, markCode } = data
	const setVal = (value, _code, idx, arrV) => setSettingAu({ value, ...obj, _code, idx, arrV })
	const [refresh, setRefresh] = useState(false)
	// Значение поля
	console.log(11, moreValue)
	return (
		<div>
			<div className='idle-field'>
				<span>Начало</span>
				<span>Конец</span>
				<span></span>

				{moreValue.begin.map((el, i) => (
					<>
						<ItemInput
							key={'a' + i + el}
							code={markCode + '.begin'}
							v={el}
							setVal={setVal}
							idx={i}
							arrV={moreValue.begin}
						/>
						<ItemInput
							key={'b' + i + moreValue.end[i]}
							code={markCode + '.end'}
							v={moreValue.end[i]}
							setVal={setVal}
							idx={i}
							arrV={moreValue.end}
						/>
						<Btn
							key={'c' + i + el + moreValue.end[i]}
							icon='/img/trash.svg'
							cls='idle-trash'
							onClick={() => del(i)}
						/>
					</>
				))}
			</div>
			<Btn title='Добавить период' cls='idle-add' onClick={add} />
		</div>
	)

	function add() {
		setVal('00:00', markCode + '.begin', moreValue.begin.length, moreValue.begin)
		setVal('00:00', markCode + '.end', moreValue.end.length, moreValue.end)
		setRefresh((p) => !p)
	}

	function del(idx) {
		moreValue.begin.splice(idx, 1)
		moreValue.end.splice(idx, 1)
		setRefresh((p) => !p)
		setVal(
			moreValue.begin.at(-1),
			markCode + '.begin',
			moreValue.begin.length - 1,
			moreValue.begin,
		)
		setVal(moreValue.end.at(-1), markCode + '.end', moreValue.end.length - 1, moreValue.end)
	}
}

function ItemInput({ v, setVal, code, idx, arrV }) {
	const [value, setValue] = useState(v)

	return (
		<Input
			type='time'
			cls='idle-input'
			value={value}
			setValue={(val) => {
				setValue(val)
				console.log(22, val, code, idx, arrV)
				setVal(val, code, idx, arrV)
			}}
		/>
	)
}
