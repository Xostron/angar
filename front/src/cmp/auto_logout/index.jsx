import { useEffect } from 'react'
import useAuthStore from '@src/store/auth'

export default function AutoLogout({}) {
	useEffect(() => {
		function onClick(e) {
			console.log(111, e)
		}
		document.addEventListener('click', onClick)
		return () => {
			document.removeEventListener('click', onClick)
		}
	}, [])
	return <></>
}
