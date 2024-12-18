import Radio from '@cmp/fields/radio'
import { useEffect } from 'react'

// чек-бокс - управление обогревателем клапанов
export default function Field({ sel, change }) {
	return (
		<fieldset className='ef-field'>
			<Radio value={null} selected={sel} name='fan' title='Выключить' change={change} />
			<Radio value='on' selected={sel} name='fan' title='Включить' change={change} />
			<Radio value='time' selected={sel} name='fan' title='По времени' change={change} />
			<Radio value='temp' selected={sel} name='fan' title='По температуре' change={change} />
		</fieldset>
	)
}
