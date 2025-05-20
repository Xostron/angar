import Row from './row'

//Тело таблицы
export default function List({data, st}) {
	if (!data || !data.list.length) return null
	return (
		<section style={st} className='set-list'>
			{data.list.map(((el, i) => <Row data={el} key={i} i={i}/>))}
		</section>
	)
}