import { Outlet } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import SubHeader from '@cmp/sub_header'
import Outdoor from '@cmp/outdoor'
import Banner from '@cmp/banner'
import useViewStore from '@store/view'

//Секции склада / Секция
export default function BuildOrSect({}) {
	let { sect } = useParams()
	const type = sect ? 'section' : 'building'
	const mb = useViewStore((s) => s.mb())
	return (
		<main className={`build ${mb}`}>
			<SubHeader />
			<Outdoor />
			<Outlet />
			<Banner type={type} />
		</main>
	)
}
