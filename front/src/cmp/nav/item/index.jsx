import useViewStore from '@src/store/view'
import Web from './web'
import Mobile from './mobile'

//Элемент навигации по секциям
export default function Item(props) {
	const mb = useViewStore((s) => s.mb())
	return mb ? <Mobile {...props} /> : <Web {...props} />
}
