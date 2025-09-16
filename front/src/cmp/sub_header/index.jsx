import useViewStore from '@store/view'
import Web from './web'
import Mobile from './mobile'

export default function SubHeader() {
	const mb = useViewStore((s) => s.mb())
	return mb ? <Mobile /> : <Web />
}
