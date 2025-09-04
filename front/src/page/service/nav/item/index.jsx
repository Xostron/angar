import { NavLink } from 'react-router-dom'

export default function Item({ data }) {
	const { icon, name, path } = data
	return (
		<NavLink className='navlink page-service-navlink' to={path}>
			{icon && <img src={icon} />}
			{name && <span>{name}</span>}
		</NavLink>
	)
}
