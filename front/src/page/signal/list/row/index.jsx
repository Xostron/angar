import Text from '@cmp/fields/text'
import IconText from '@cmp/fields/icon_text'
import defImg from '@tool/icon/alarm'

//Строка сигналов
export default function Row({ data, i }) {
	return (
		<div className='signal-row'>
			<Text
				cls='list-row list-row-date'
				data={{
					value: new Date(data.date).toLocaleString(),
				}}
			/>
			<IconText
				cls='list-row'
				data={{
					value: (data.title ?? '') + ' ' + data.msg,
					icon: img(data.typeSignal),
				}}
			/>
		</div>
	)
}

function img(type) {
	switch (type) {
		case 'critical':
			return '/img/signal/critical.svg'
		case 'fan':
			return '/img/signal/fan.svg'
		case 'info':
			return '/img/signal/info.svg'
		case 'sensor':
			return '/img/signal/sensor.svg'
		case 'timer':
			return '/img/signal/timer.svg'
		case 'valve':
			return '/img/signal/valve.svg'
		case 'weather':
			return '/img/signal/weather.svg'
		default:
			return ''
	}
}
