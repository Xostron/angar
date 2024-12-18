import './style.css'

export default function Dialog({ href, children, cls = '' }) {
	let cl = 'dia ' + cls
	return (
		<dialog
			ref={href}
			className={cl}
			onClick={(e) => {
				if (e.target === e.currentTarget) href.current.close()
			}}
		>
			{children}
		</dialog>
	)
}
