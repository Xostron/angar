import { useEffect } from 'react'

// Сенсорная клавиатура: по кнопке Enter закрывать клавиатуру
export default function useTouchKeyboard() {
	useEffect(() => {
		// Скрыть сенсорную клавиатуру -
		function keyboard(e) {
			if (e.key === 'Enter') e.srcElement.blur()
		}
		addEventListener('keydown', keyboard)
		return () => {
			removeEventListener('keydown', keyboard)
		}
	}, [])
}
