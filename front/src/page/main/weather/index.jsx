import Region from './region'
import './style.css'

export default function Weather({data}) {
	const url = '/img/weather.png'
	const styles = {
		backgroundImage: `url(${url})`
	}
	return (
		<section className='main-weather'>
			<div className='mw-left' style={styles}>
				<Region data={data}/>
			</div>
			<div className='mw-right'></div>
		</section>
	)
}
