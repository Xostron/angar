import { useHref, useNavigate } from 'react-router-dom'
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
	const { title, icon, path, active } = data
	const cur = href.split('/').at(3) ?? null
	const cls = ['menu-button', mb, active.includes(cur) ? ' active' : ''].join(' ')
	return <Btn onClick={onClick} cls={cls} title={title} icon={icon} />

	function onClick() {
		if (link?.hasChanged) {
			link.action(`../${path}`)
			return
		}
		setLink(null)
		navigate(path)
	}
}
