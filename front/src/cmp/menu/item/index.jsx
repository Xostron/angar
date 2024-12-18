import Btn from '@cmp/fields/btn'
import { useHref, useNavigate } from 'react-router-dom'
import useWarn from '@store/warn'
// import useEquipStore from '@store/equipment'

//Элемент меню
export default function Item({ data }) {
	const { link, setLink } = useWarn()
	const { title, icon, path, active } = data
	// const [list] = useEquipStore(({list})=>[list])
	const href = useHref()
	const cur = href.split('/').at(3) ?? null
	const navigate = useNavigate()

	function onClick() {
		if (link?.hasChanged) {
			link.action(`../${path}`)
			return
		}
		setLink(null)
		navigate(path)
	}

	let cls = null
	if (active.includes(cur)) cls = 'active'
	return <Btn onClick={onClick} cls={cls} title={title} icon={icon} />
}
