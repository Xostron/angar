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
							value={el}
							// setValue={(val) => {
							// 	setValue(val)
							// 	data.setValue(val)
							// }}
						/>
						<Input
							type='time'
							cls='idle-input'
							value={moreValue.end[i]}
							// setValue={(val) => {
							// setValue(val)
							// data.setValue(val)
							// }}
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
