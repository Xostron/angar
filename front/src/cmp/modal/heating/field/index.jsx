import Radio from '@cmp/fields/radio'
import { useEffect } from 'react'

// чек-бокс - управление обогревателем клапанов
export default function Field({ sel, change }) {
	return (
		<fieldset className='ef-field'>
			<Radio value='off' selected={sel} name='heat' title='Выключить' change={change} />
			<Radio value='on' selected={sel} name='heat' title='Включить' change={change} />
			<Radio value='auto_time' selected={sel} name='heat' title='По времени' change={change} />
		</fieldset>
	)

}
