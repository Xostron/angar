import Radio from '@cmp/fields/radio'
import Input from '@cmp/fields/input'

// чек-бокс - управление вентилятором
export default function Field({ sel, change, spO, setSpO }) {
	return (
		<fieldset className='ef-field'>
			<Radio value='stop' selected={sel} name='vlv' title='Стоп' change={change} />
			<Radio value='icls' selected={sel} name='vlv' title='Закрыть' change={change} />
			<Radio value='iopn' selected={sel} name='vlv' title='Открыть' change={change} />
			<span>
				<Radio value='popn' selected={sel} name='vlv' title='Открыть на' change={change} />
				<Input
					
					type='number'
					min={0}
					max={100}
					step={1}
					value={spO}
					setValue={setSpO}
					cls='cell-modal'
				/>
				{'%'}
			</span>
			{/* <Radio value='tune' selected={sel} name='vlv' title='Калибровка' change={change} /> */}
		</fieldset>
	)
}
