import { useEffect } from 'react'

// Экспериментальная функция доступна только Chrome, Edge, Opera
export default function useListenNav() {
	useEffect(() => {
		function cb(e) {
			console.log(222, e)
		}
		navigation.addEventListener('navigate', cb)
		console.log(111, '+')
		return () => {
			navigation.removeEventListener('navigate', cb)
			console.log(111, '-')
		}
	}, [])
}
