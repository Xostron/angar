import Logo from './logo'
import Time from './time'
import './style.css'
import useViewStore from '@store/view'
import Menu from '../menu'
import Burger from './burger'
//Шапка страницы
export default function Header({}) {
	const mb = useViewStore((s) => s.mb())
	const bmb = useViewStore((s) => s.bmb())
	console.log(222, bmb)
	const cls = ['head', mb].join(' ')
	return (
		<header className={cls}>
			<Logo />
			{bmb && <Burger />}
			{!bmb && <Menu />}
			{!bmb && <Time />}
		</header>
	)
}
