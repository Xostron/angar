import Header from '@cmp/header'
import Navm from '@src/cmp/navm'
import { Outlet } from 'react-router-dom'

//Меню склада
export default function Building({}) {
	return (
		<>
			<Header menu />
			<Outlet />
			{/* <Navm /> */}
		</>
	)
}
