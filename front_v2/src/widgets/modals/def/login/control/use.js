import { useEffect, useState } from "react"


//Хуки авторизации
export default function useEntry(show, setShow) {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	useEffect(() => {
		const onClick = e => {
			if (e.target.closest('.entry')) return
			if (e.target.closest('.control')) return
			if (show) setShow(false)
		}
		document.addEventListener('click', onClick)
		return _ => document.removeEventListener('click', onClick)
	}, [show])

	return {login, password, setLogin, setPassword}
}