import { useState } from 'react'
import { CardTest, Sublist, Errlist } from './fn'

/**
 * Карточка Теста + список ИМ + список ошибок ИМ
 * @param {*} param0 type = passed | current | failed
 * @returns
 */
function Item({ data }) {
	// Скрыть/показать субсписок
	const [open, setOpen] = useState(false)
	// Тип теста: Пройден / Провален
	const type = data.list.some((el) => el.list.length) ? 'failed' : 'passed'
	// Наличие субсписка
	const hasSublist = !!data.list.length && type == 'failed'

	return (
		<li className={`wh-item ${open && hasSublist ? 'open' : ''}`} onClick={onClick}>
			<CardTest data={data} type={type} open={open} />
			<Sublist data={data} type={type} has={hasSublist} />
		</li>
	)

	// Скрыть/показать субсписок
	function onClick() {
		setOpen((v) => !v)
	}
}

export default Item
