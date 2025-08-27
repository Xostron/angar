import { useNavigate, Link } from 'react-router-dom'

//Элемент списка настроек
export default function Item({ cur, data, index, dialog, hasChanged }) {
	const navigate = useNavigate()

	const { name, icon, path } = data
	const r = ~~(index / 2) + 1 // тоже самое что parseInt()
	const c = (index + 1) % 2 || 2
	const gridArea = `${r}/${c}/${r + 1}/${c + 1}`
	const st = cur === data.code ? { backgroundColor: 'var(--primary)', gridArea } : { gridArea }

	return (
		<button style={st} onClick={onClick}>
			<img src={icon} alt='' />
			<p>{name}</p>
		</button>
	)
	// Вызов окна подтверждения, если функция dialog передана в атрибутах и данные изменены
	function onClick(e) {
		if (dialog && hasChanged) {
			dialog(path)
			return
		}
		navigate(path)
	}
}
