import { useState } from 'react'
import useWarn from '@store/warn'
import Btn from '@cmp/fields/btn'
import './style.css'

export default function DateTime({ data }) {
	const { onSave } = data
	const clear = useWarn((s) => s.clear)
	
	// Получаем текущую дату и время в формате для input datetime-local
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
	
	const [dateTime, setDateTime] = useState(defaultDateTime)

	const handleSave = () => {
		// Преобразуем формат из 'YYYY-MM-DDTHH:MM' в 'YYYY-MM-DD HH:MM:SS'
		const dt = new Date(dateTime)
		const formattedDateTime = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:00`
		onSave(formattedDateTime)
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

