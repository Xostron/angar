import Logo from './logo'
import Time from './time'
import './style.css'

//Шапка страницы
export default function Header({ children }) {
	return (
		<header className='head'>
			<section>
				<Logo />
				{children}
			</section>
			<Time />
		</header>
	)
}
