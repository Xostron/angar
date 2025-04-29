//Кнопка с иконкой
export default function Btn({ title, icon, onClick, txt = '', cls, style }) {
	let cl = ['btn', cls]
	cl = cl.join(' ')

	return (
		<button onClick={onClick} className={cl} style={style}>
			{!!txt && <span>{txt}</span>}
			{icon && <img src={icon} />}
			{title && <span>{title}</span>}
		</button>
	)
}
