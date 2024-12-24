import Region from './region'
import './style.css'

export default function Weather({data}) {
	return (
		<section className='main-weather'>
			<div className='mw-left'>
				<Region data={data}/>
			</div>
			<div className='mw-right'></div>
		</section>
	)
}
