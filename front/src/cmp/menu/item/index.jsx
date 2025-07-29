import Btn from '@cmp/fields/btn'
import { useHref, useNavigate } from 'react-router-dom'
import useWarn from '@store/warn'
// import useEquipStore from '@store/equipment'
import useAuthStore from '@store/auth'

//Элемент меню
export default function Item({ data }) {
	const { name } = useAuthStore()
	const navigate = useNavigate()
	const href = useHref()
	const { link, setLink } = useWarn()
	const { title, icon, path, active, id } = data
	const cur = href.split('/').at(3) ?? null
	let cls = 'menu-button'
	if (active.includes(cur)) cls += ' active'
	const root = name == 'Root' && id === 7
	return (
		<>{(root || id !== 7) && <Btn onClick={onClick} cls={cls} title={title} icon={icon} />}</>
	)

	function onClick() {
		if (link?.hasChanged) {
			link.action(`../${path}`)
			return
		}
		setLink(null)
		navigate(path)
	}
}
