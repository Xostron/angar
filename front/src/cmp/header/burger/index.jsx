import useWarnStore from '@store/warn'
import './style.css'

// Кнопка с вызовом меню навигации
export default function Burger() {
	const warnCustom = useWarnStore((s) => s.warnCustom)

	return (
		<button className='cmp-burger-wrapper' onClick={onClick}>
			<div className='cmp-burger'></div>
		</button>
	)
	function onClick() {
		warnCustom({ cls:'cmp-warn-def-burger-dialog' }, 'burger')
	}
}
