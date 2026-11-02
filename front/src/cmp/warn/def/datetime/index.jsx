import { useState } from 'react'
import useWarn from '@store/warn'
import Btn from '@cmp/fields/btn'
import { posNow, posInput, posFromInput, posParts, pad2 } from '@tool/datetime'
import './style.css'

export default function DateTime({ data }) {
	const { onSave } = data
	const clear = useWarn((s) => s.clear)

	// Текущие дата и время POS в формате для input datetime-local
	const [dateTime, setDateTime] = useState(() => posInput(posNow()))

	const handleSave = () => {
		const ms = posFromInput(dateTime)
		if (ms === null) return
		// Значение трактуется как время POS -> строку для установки времени на POS без пересчёта зоны
		const p = posParts(ms)
		onSave(`${p.y}-${pad2(p.mo)}-${pad2(p.d)} ${pad2(p.h)}:${pad2(p.mi)}:${pad2(p.s)}`)
		clear()
	}

	const closeModal = () => {
		clear()
	}

	return (
		<div className='entry datetime-modal'>
			<div className='datetime-modal-content'>
				<h3 className='datetime-modal-title'>Установить время и дату</h3>

				<div className='datetime-field'>
					<span className='datetime-field-label'>Дата и время:</span>
					<input
						type='datetime-local'
						value={dateTime}
						onChange={(e) => setDateTime(e.target.value)}
						className='datetime-input'
					/>
				</div>

				<div className='datetime-modal-buttons'>
					<Btn title='Отмена' onClick={closeModal} />
					<Btn title='Установить' onClick={handleSave} />
				</div>
			</div>
		</div>
	)
}

