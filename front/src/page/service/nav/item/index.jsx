import { NavLink } from 'react-router'

export default function Item({ data }) {
	const { icon, name, path } = data
	const className = 'navlink page-service-navlink'
	// const fnClassname = ({ isActive }) => (isActive ? `${className} active` : className)
	return (
		<NavLink className={className} to={path}>
			{icon && <img src={icon} />}
			{name && <span>{name}</span>}
		</NavLink>
	)
}
