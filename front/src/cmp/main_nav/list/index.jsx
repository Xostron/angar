import { NavLink } from 'react-router'

export default function List({ list }) {
	if (!list) return <></>
	const className = 'navlink'
	return (
		<section className='cmp-mainnav-section'>
			{list.map((el, i) => {
				const fnClassname = ({ isActive }) => (isActive ? `${className} active` : className)
				return (
					<NavLink key={el.id} className={fnClassname} to={el.path}>
						{el.icon && <img src={el.icon} />}
						{el.title && <span>{el.title}</span>}
					</NavLink>
				)
			})}
		</section>
	)
}
