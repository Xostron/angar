import './style.css'

export default function Weather7d({ weather }) {
	const { forecast, update } = weather

	const items = forecast
		.reduce(
			(acc, el) => {
				acc.sub.push(el)
				if (acc.sub.length < 4) return acc
				acc.result.push(acc.sub)
				acc.sub = []
				return acc
			},
			{ result: [], sub: [] }
		)
		.result.map((el, i) => <Day key={i} items={el} idx={i} />)

	const dd1 = new Date(forecast[0].time).toLocaleString('ru', { day: '2-digit', month: '2-digit' })
	const dd2 = new Date(forecast[27].time).toLocaleString('ru', { day: '2-digit', month: '2-digit' })
	return (
		<section className='cmp-weather7d'>
			<h1>Прогноз погоды {dd1 && dd2 ? `c ${dd1} по ${dd2}` : ''}</h1>
			<article className='cmp-weather7d-content'>{!!items.length && items}</article>
		</section>
	)
}

// День - состоит из 4 замеров температуры
function Day({ items, idx }) {
	const dd = new Date(items[0].time).toLocaleString('ru', { weekday: 'short', day: '2-digit', month: '2-digit' })
	return (
		<article className='cmp-weather7d-day'>
			{idx == 0 ? 'Сегодня ' : ''}
			{dd}
			<div className='cmp-weather7d-day-content'>{!!items.length && items.map((el, i) => <Item key={i} data={el} />)}</div>
		</article>
	)
}

// Замер температуры
function Item({ data }) {
	const { time, temperature_2m, relative_humidity_2m, weather_code, weather_name } = data
	const img = <img src={`/img/weather/${weather_code}.svg`} alt={weather_code} />

	const hh = new Date(time).toLocaleString('ru', { hour: '2-digit', minute: '2-digit' })
	return (
		<div className='cmp-weather7d-day-item'>
			<span>{hh}</span>
			{img}
			<span>
				{temperature_2m > 0 ? '+' : ''}
				{temperature_2m}
			</span>
			<span>{relative_humidity_2m}%</span>
		</div>
	)
}
