import { useHref, useNavigate } from 'react-router'
import useWarn from '@store/warn'
import useAuthStore from '@store/auth'
import useViewStore from '@store/view'
import Btn from '@cmp/fields/btn'

//Элемент меню
export default function Item({ data }) {
	const { name } = useAuthStore()
	const navigate = useNavigate()
	const href = useHref()
	const { link, setLink } = useWarn()
	const mb = useViewStore((s) => s.mb())
	const bmb = useViewStore((s) => s.bmb())
	const { title, icon, path, active } = data
	const cur = href.split('/').at(3) ?? href.split('/').at(1)
	const cls = ['menu-button', mb, active.includes(cur) ? ' active' : ''].join(' ')

	return <Btn onClick={onClick} cls={cls} title={title} icon={icon} />

	function onClick() {
		if (link?.hasChanged) {
			link.action(`../${path}`)
			return
		}
		setLink(null)
		if (!bmb) navigate(path)
		if (bmb) bmbNavigate(path, href,navigate)
		// console.log(111, path, href, cur)
	}
}

// Навигация через модальное окно (мобилка)
function bmbNavigate(path, href,navigate) {
	// Строим абсолютные пути
	let newPath = href.split('/').slice(0, 3).join('/') + '/'
	switch (path) {
		// Склады
		case '/building':
			newPath = path
			break
		// Склад
		case '':
			break
		// Остальные дети склада
		default:
			newPath += path
			break
	}
	navigate(newPath)
}
