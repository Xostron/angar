import Pui from './pui'
import Row from './row'

//Тело таблицы
export default function List({ data, type }) {
	if (!data?.length) return
	return type === 'pui' ? (
		<Pui data={data} />
	) : (
		<section className='list-sen'>
			{data.map((el) => (
				<Row key={el._id} data={el} />
			))}
		</section>
	)
}
