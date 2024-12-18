import Row from './row'

//Тело таблицы
export default function List({ data }) {
	return <section className='list-sen'>{data?.length ? data.map((el, i) => <Row key={i} data={el} />) : ''}</section>
}
