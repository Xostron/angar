import useViewStore from '@src/store/view'
import Mobile from './mobile'
import Web from './web'

export default function Sidebar() {
	const mb = useViewStore((s) => s.mb())
	return mb ? <Mobile /> : <Web />
}
