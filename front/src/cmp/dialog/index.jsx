import './style.css'
import useWarn from '@store/warn'

export default function Dialog({ href, children, cls = '' }) {
	const { clear } = useWarn(({ clear }) => ({ clear }))
	let cl = 'dia ' + cls
	return (
		<dialog ref={href} className={cl} onClick={backdropClose}>
			{children}
		</dialog>
	)
	// Закрыть по клику на задний фон и очистить zustand
	function backdropClose(e) {
		if (e.target !== e.currentTarget) return
		href.current.close()
		clear()
	}
}
