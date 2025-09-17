import { Outlet } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import SubHeader from '@src/cmp/sub_header'
import Outdoor from '@cmp/outdoor'
import Banner from '@cmp/banner'
import useViewStore from '@store/view'
import './style.css'

//Секции склада / Секция
export default function BuildOrSect({}) {
	const mb = useViewStore((s) => s.mb())
	let { sect } = useParams()
	const type = sect ? 'section' : 'building'
	return (
		<main className={`build ${mb}`}>
			<SubHeader />
			<Outdoor />
			<Outlet />
			<Banner type={type} />
		</main>
	)
}
