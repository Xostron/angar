import { useEffect } from "react"
import Item from "./item"


//Сам выпадающий список
export default function Modal({show, setShow, list, setVal, val}) {
	useEffect(() => {
		const onClick = e => {
			if (e.target.closest('.popup')) return
			if (e.target.closest('.modal')) return
			if (show) setShow(false)
		}
		document.addEventListener('click', onClick)
		return _ => document.removeEventListener('click', onClick)
	}, [show])
	if (!show) return null
	return (
		<div className="modal">
			{list.map((el, i) =><Item data={el} setVal={setVal} key={i} val={val}/>)}
		</div>
	)
}