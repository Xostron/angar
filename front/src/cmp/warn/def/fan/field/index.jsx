import Radio from '@cmp/fields/radio'
import { useEffect } from 'react'

// чек-бокс - управление вентилятором
/**
 *
 * @param {*} active В ручном режиме
 * @param {*} state Состояние вентилятора
 * @param {*} sel Выбранная радиокнопка
 * @param {*} change Переключение радиокнопок
 * @returns
 */
export default function Field({ sel, change, active, state }) {
	const title = state !== 'off' ? 'Вывести из работы' : 'Ввести в работу'
	return (
		<fieldset className='ef-field'>
			<Radio
				cls={active && state !== 'run' ? '' : 'off'}
				value='run'
				selected={active ? sel : ''}
				name='fan'
				title='Включить'
				change={change}
				disabled={state === 'run'}
			/>
			<Radio
				cls={active && state !== 'stop' ? '' : 'off'}
				value='stop'
				selected={active ? sel : ''}
				name='fan'
				title='Выключить'
				change={change}
				disabled={state === 'stop'}
			/>
			<Radio
				value='off'
				selected={sel}
				name='fan'
				title={title}
				change={change}
			/>
		</fieldset>
	)
}
