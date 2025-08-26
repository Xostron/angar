import useWarnStore from '@store/warn'
import './style.css'

// Кнопка с вызовом меню навигации
export default function Burger() {
	const warn = useWarnStore((s) => s.warn)

	return (
		<button className='cmp-burger-wrapper' onClick={onClick}>
			<div className='cmp-burger'></div>
		</button>
	)
	function onClick() {
		warn({ cls:'cmp-warn-def-burger-dialog' }, 'burger')
	}
}
