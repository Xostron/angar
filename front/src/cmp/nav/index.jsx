import Item from './item'

//Навигация по секциям
export default function Nav({ cur, data = [], ph, cls, stl, dialog, hasChanged }) {
	let cl = ['nav', cls]
	cl = cl.join(' ')
	return (
		<nav style={stl} className={cl}>
			{data?.length &&
				data.map((el) => (
					<Item key={el._id} data={el} cur={cur} ph={ph} dialog={dialog} hasChanged={hasChanged} />
				))}
		</nav>
	)
}
