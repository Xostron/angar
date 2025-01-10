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
	let { sect } = useParams()
	const [sections] = useEquipStore(({ sections }) => [sections()])
	const navigate = useNavigate()
	const location = useLocation()
	useEffect(() => {
		if (sections?.length === 1 && !sect) {
			const path = `${location.pathname}/section/${sections?.[0]?._id}`.replace('//', '/')
			navigate(path)
		}
	}, [sect])

	return (
		<main className='build'>
			<SubHeader />
			<Outdoor />
			<Outlet />
			<Banner />
		</main>
	)
}
