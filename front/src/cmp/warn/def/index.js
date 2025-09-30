import person from './person'
import turn from './turn'
import warn from './warn'
import fan from './fan'
import fanao from './fan_ao'
import valve from './valve'
import burger from './burger'
import ethernet from './ethernet'
import wifi from './wifi'
import forecast_analytic from './forecast_analytic'
import mode_mobile from './mode_mobile'

export default {
	person,
	turn,
	warn,
	fan,
	fanao,
	valve,
	burger,
	ethernet,
	wifi,
	forecast_analytic,
	mode_mobile, 
	notfound: ({ data, entryCode }) => (
		<div className='entry'>Модального окна {entryCode} не существует</div>
	),
}
