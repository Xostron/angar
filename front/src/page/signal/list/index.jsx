import { useParams, useNavigate, useLocation } from 'react-router-dom'
import useInputStore from '@store/input'
import Row from './row'

//Тело таблицы
export default function List({}) {
	const { build } = useParams()
	const [signal] = useInputStore(({ alarm }) => [alarm.signal])
	return (
		<section className='list-signal'>
			{!!signal?.[build]?.length && signal?.[build].map((el, i) => <Row data={el} key={i} i={i} />)}
		</section>
	)
}
