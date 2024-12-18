import { Link } from 'react-router-dom'

//Элемент навигации по секциям
export default function Item({ data, cur, ph, dialog, hasChanged }) {
	const { name, _id } = data

	// const navigate = useNavigate()
	const path = cur ? `../${ph}/` + _id : `${ph}/` + _id

	let cls = ['btn nav-item']
	if (cur == _id) cls.push('active')
	cls = cls.join(' ')

	// return <Btn onClick={onClick} cls={cls} title={name} />

	return (
		<Link to={path} onClick={onClick} className={cls}>
			{name}
		</Link>
	)
	// Вызов окна подтверждения, если функция dialog передана в атрибутах и данные изменены
	function onClick(e) {
		if (dialog && hasChanged) {
			e.preventDefault()
			dialog(path)
		}
	}
}
