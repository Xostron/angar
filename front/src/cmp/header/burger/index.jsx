import useWarnStore from '@store/warn'
import './style.css'

export default function Burger() {
	const warnCustom = useWarnStore((s) => s.warnCustom)

	return (
		<div className='cmp-burger-wrapper' onClick={onClick}>
			<div className='cmp-burger'></div>
		</div>
	)
	function onClick() {
		warnCustom({ cls:'cmp-warn-def-burger-dialog' }, 'burger')
	}
}
