import Row from './row'
// import useWarn from '@store/warn'
// import useAuthStore from '@store/auth'


//Тело таблицы
export default function List({ list, st }) {
	if (!list.length) return null

	return (
		<section style={st} className='set-list' /*onClick={onClick}*/>
			{list.map((el, i) => (
				<Row data={el} key={i} i={i} />
			))}
		</section>
	)
}
