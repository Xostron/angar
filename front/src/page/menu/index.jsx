import Header from "@cmp/header"
import { Outlet } from "react-router-dom"


//Меню склада
export default function Building({}) {
	return (
		<>
			<Header/>				
			<Outlet/>
		</>
	)
}