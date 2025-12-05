import Radio from '@cmp/fields/radio'
import Input from '@cmp/fields/input'

// чек-бокс - управление вентилятором
/**
 *
 * @param {*} active В ручном режиме
 * @param {*} state Состояние вентилятора
 * @param {*} sel Выбранная радиокнопка
 * @param {*} change Переключение радиокнопок
 * @returns
 */
export default function Field({ sel, change, active, state, spO, setSpO, off, container }) {
	const title = off ? 'Ввести в работу' : 'Вывести из работы'
	const styleIn = active ? 'run' : 'off'
	return (
		<fieldset className='ef-field'>
			<span className={active && state !== 'run' ? '' : 'off'}>
				<Radio
					value='run'
					selected={active ? sel : ''}
					name='fan'
					title='Включить'
					change={change}
					disabled={state === 'run'}
				/>
				{/* {active && ( */}
				<>
					<Input
						type='number'
						min={0}
						max={100}
						step={1}
						value={spO}
						setValue={setSpO}
						cls={`cell-modal ${styleIn}`}
						disabled={active ? false : true}
						keyboardContainer={container}
					/>
					%
				</>
				{/* )} */}
			</span>
			<Radio
				cls={active && state !== 'stop' ? '' : 'off'}
				value='stop'
				selected={active ? sel : ''}
				name='fan'
				title='Выключить'
				change={change}
				disabled={state === 'stop'}
			/>

			<Radio value='off' selected={sel} name='fan' title={title} change={change} />
		</fieldset>
	)
}
