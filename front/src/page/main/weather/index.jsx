import Region from './region'
import './style.css'

export default function Weather({}) {
	const url = '/img/weather.png'
	const styles = {
		backgroundImage: `url(${url})`
	}
	return (
		<section className='main-weather'>
			<div className='mw-left' style={styles}>
				<Region />
			</div>
			<div className='mw-right'></div>
		</section>
	)
}
