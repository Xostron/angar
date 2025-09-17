import useViewStore from '@src/store/view'
import Mobile from './mobile'
import Web from './web'

export default function Today({ weather, type }) {
	const bmb = useViewStore((s) => s.bmb())
	return bmb ? <Mobile weather={weather} type={type} /> : <Web weather={weather} type={type} />
}
