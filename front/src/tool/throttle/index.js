// Ограничивает частоту выполнения функции
export default function throttle(ref, fn, ms) {
	ref.current = setTimeout(() => {
		ref.current = null
		console.log('throttle')
		fn()
	}, ms)
}
