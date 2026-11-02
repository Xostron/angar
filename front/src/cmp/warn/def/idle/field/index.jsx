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
	// Значение поля

	return (
		<div>
			<div className='idle-field'>
				<span>Начало</span>
				<span>Конец</span>
				<span></span>

				{moreValue.begin.map((el, i) => (
					<>
						<ItemInput
							code={markCode + '.begin'}
							v={el}
							setVal={setVal}
							idx={i}
							arrV={moreValue.begin}
						/>
						<ItemInput
							code={markCode + '.end'}
							v={moreValue.end[i]}
							setVal={setVal}
							idx={i}
							arrV={moreValue.end}
						/>
						<Btn icon='/img/trash.svg' cls='idle-trash' />
					</>
				))}
			</div>
			<Btn title='Добавить период' cls='idle-add' />
		</div>
	)
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
				setVal(val, code, idx, arrV)
			}}
		/>
	)
}
