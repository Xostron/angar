import Moment from 'react-moment'
import './style.css'

//Текущее время
export default function Time({ }) {
	// const now = new Date()
	// const a = now.toLocaleString().split(', ').reverse()
	// const time = a[0].substring(0,5)
	// const date = a[1]
	// return <time datatype={now}>{time}<br/>{date}</time>
	return (
		<div className='time'>
			<Moment format="HH:mm" interval={1000} />
			<Moment format="DD.MM.YYYY" interval={1000} />
		</div>
	)

}