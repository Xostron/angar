import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import SimpleKeyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import './index.css'

/**
 * Компонент экранной клавиатуры
 * @param {string} type - Тип клавиатуры: 'default' (обычная без numpad) или 'numeric' (цифровая)
 * @param {string} value - Текущее значение поля ввода
 * @param {function} onChange - Колбэк при изменении значения
 * @param {function} onClose - Колбэк при закрытии клавиатуры (опционально)
 * @param {string} placeholder - Placeholder для поля ввода
 * @param {HTMLElement} container - Контейнер для рендеринга (для dialog используйте ref на dialog)
 * @param {boolean} showInput - Показывать ли дублирующее поле ввода (по умолчанию true)
 */
export default function Keyboard({ 
	type = 'default', 
	value = '', 
	onChange, 
	onClose,
	placeholder = 'Введите текст...',
	container = null,
	showInput = false
}) {
	const [inputValue, setInputValue] = useState(value)
	const [layoutName, setLayoutName] = useState('default')
	const keyboard = useRef()


	useEffect(() => {
		setInputValue(value)
		// Синхронизируем виртуальную клавиатуру с новым значением
		if (keyboard.current) {
			keyboard.current.setInput(value)
		}
	}, [value])

	// Обработчик изменения через клавиатуру
	const onKeyPress = (button) => {
		if (button === '{shift}' || button === '{lock}') {
			handleShift()
		} else if (button === '{enter}' && onClose) {
			onClose()
		}
	}

	// Обработчик изменения значения
	const onChangeInput = (input) => {
		setInputValue(input)
		if (onChange) {
			onChange(input)
		}
	}

	// Обработчик изменения через поле ввода
	const onChangeInputField = (event) => {
		const value = event.target.value
		setInputValue(value)
		keyboard.current.setInput(value)
		if (onChange) {
			onChange(value)
		}
	}

	// Переключение между раскладками (shift)
	const handleShift = () => {
		const newLayoutName = layoutName === 'default' ? 'shift' : 'default'
		setLayoutName(newLayoutName)
	}

	// Раскладки для обычной клавиатуры (без numpad)
	const defaultLayout = {
		default: [
			'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
			'q w e r t y u i o p [ ] \\',
			"a s d f g h j k l ; ' {enter}",
			'{shift} z x c v b n m , . / {shift}',
			'{space}'
		],
		shift: [
			'~ ! @ # $ % ^ & * ( ) _ + {bksp}',
			'Q W E R T Y U I O P { } |',
			'A S D F G H J K L : " {enter}',
			'{shift} Z X C V B N M < > ? {shift}',
			'{space}'
		]
	}

	// Раскладка для цифровой клавиатуры
	const numericLayout = {
		default: [
			'{bksp}',
			'7 8 9',
			'4 5 6',
			'1 2 3',
			'- 0 .'
		]
	}

	// Настройка кнопок
	const display = type === 'numeric' 
		? {
			'{bksp}': '⌫',
		}
		: {
			'{bksp}': '⌫ Backspace',
			'{enter}': '↵ Enter',
			'{shift}': '⇧ Shift',
			'{space}': 'Пробел'
		}

	const keyboardContent = (
		<div className={`keyboard-wrapper ${type} ${container ? 'in-dialog' : ''} ${!showInput ? 'no-input' : ''}`}>
			{/* Кнопка закрытия клавиатуры */}
			<div className="keyboard-close-btn-input-container">
				{/* Поле для дублирования ввода */}
				{showInput && (
					<input
					type="text"
					className="keyboard-input-display"
					value={inputValue}
					onChange={onChangeInputField}
					placeholder={placeholder}
					/>
				)}
				{showInput &&onClose && (
					<button 
					className="keyboard-close-btn" 
					onClick={onClose}
					title="Закрыть клавиатуру"
					>
						✕
					</button>
				)}
			</div>
			{/* Клавиатура */}
			<SimpleKeyboard
				keyboardRef={r => (keyboard.current = r)}
				layoutName={layoutName}
				layout={type === 'numeric' ? numericLayout : defaultLayout}
				onChange={onChangeInput}
				onKeyPress={onKeyPress}
				display={display}
				theme={`simple-keyboard hg-theme-default hg-layout-${type}`}
				buttonTheme={[
					{
						class: 'hg-highlight',
						buttons: '{enter} {shift}'
					}
				]}
			/>
		</div>
	)

	// Если передан контейнер (например, dialog), рендерим через портал
	if (container) {
		return createPortal(keyboardContent, container)
	}

	return keyboardContent
}