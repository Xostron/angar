import Radio from '@cmp/fields/radio'
import { useEffect } from 'react'
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
export default function Field({ moreValue, idB, codeStg }) {
	return (
		<div>
			<div className='idle-field'>
				<span>Начало</span>
				<span>Конец</span>
				<span></span>

				{moreValue.begin.map((el, i) => (
					<>
						<Input
							type='time'
							cls='idle-input'
							// min={data.min}
							// max={data.max}
							// step={data.step}
							value={el}
							// disabled={disabled}
							// setValue={(val) => {
							// 	setValue(val)
							// 	data.setValue(val)
							// }}
							// style={st}
							// title={data.code}
						/>
						<Input
							type='time'
							cls='idle-input'
							// type={data.type}
							// min={data.min}
							// max={data.max}
							// step={data.step}
							value={moreValue.end[i]}
							// disabled={disabled}
							// setValue={(val) => {
							// setValue(val)
							// data.setValue(val)
							// }}
							// style={st}
							// title={data.code}
						/>
						<Btn icon='/img/trash.svg' cls='idle-trash' />
					</>
				))}
			</div>
			<Btn title='Добавить период' cls='idle-add' />
		</div>
	)
}

// function
