import Logo from './logo'
import Time from './time'
import useViewStore from '@store/view'
import Menu from '../menu'
import Burger from './burger'
import MainNav from '../main_nav'
import './style.css'

//Оглавление страницы
export default function Header({ menu = false }) {
	const mb = useViewStore((s) => s.mb())
	const bmb = useViewStore((s) => s.bmb())
	const cls = ['head', mb].join(' ')
	return (
		<header className={cls}>
			<Logo />
			{bmb && <Burger />}
			{!bmb && menu && <Menu />}
			{/* {!bmb && <MainNav/>} */}
			{!bmb && <Time />}
		</header>
	)
}
