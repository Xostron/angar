import Header from "@cmp/header"
import Menu from "@cmp/menu"
import { Outlet } from "react-router-dom"


//Меню склада
export default function Building({}) {
	return (
		<>
			<Header>
				<Menu/>
			</Header>
			<Outlet/>
		</>
	)
}