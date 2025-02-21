//Кнопка с иконкой
export default function Btn({ title, icon, onClick, cls, style }) {
	let cl = ['btn', cls]
	cl = cl.join(' ')
	
	return (
		<button onClick={onClick} className={cl} style={style}>
			{icon && <img src={icon} />}
			{title && <span>{title}</span>}
		</button>
	)
}