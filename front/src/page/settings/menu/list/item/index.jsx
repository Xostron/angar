import { Link } from 'react-router-dom'

//Элемент списка меню
export default function Item({ data, index }) {
	const { name, icon, path } = data
	const col = 6
	const r = 2 + ~~(index / col)
	const c = 1 + (index % col)
	return (
		<Link to={path} style={{ gridArea: `${r}/${c}/${r + 1}/${c + 1}` }} className='setm'>
			<img src={icon} />
			{name}
		</Link>
	)
}
