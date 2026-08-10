import Logo from './logo'
import Time from './time'
import useViewStore from '@store/view'
import Menu from '../menu'
import Burger from './burger'
import Person from '@cmp/person'
import { useLocation } from 'react-router-dom'
import './style.css'

//Оглавление страницы
export default function Header({ menu = false }) {
	const mb = useViewStore((s) => s.mb())
	const bmb = useViewStore((s) => s.bmb())
	const location = useLocation()
	const cls = ['head', mb].join(' ')
	return (
		<header className={cls}>
			<Logo />
			{location.pathname === '/building' && <Person />}
			{bmb && <Burger />}
			{!bmb && menu && <Menu />}
			{!bmb && <Time />}
		</header>
	)
}
