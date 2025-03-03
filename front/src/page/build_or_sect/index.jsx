import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useEquipStore from '@store/equipment'
import SubHeader from '@cmp/sub_header'
import Outdoor from '@cmp/outdoor'
import Banner from '@cmp/banner'

//Секции склада / Секция
export default function BuildOrSect({}) {
	let { sect, build } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const [sects] = useEquipStore(({ sections }) => [sections()])
	const type = sect ? 'section' : 'building'

	useEffect(() => {
		if (sects?.length === 1 && !sect) {
			const path = `${location.pathname}/section/${sects?.[0]?._id}`.replace('//', '/')
			navigate(path)
		}
	}, [])

	return (
		<main className='build'>
			<SubHeader />
			<Outdoor />
			<Outlet />
			<Banner type={type} />
		</main>
	)
}
