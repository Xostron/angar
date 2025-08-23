import MainNav from '@cmp/main_nav'
import Menu from '@src/cmp/menu'
import useWarnStore from '@src/store/warn'
import './style.css'

export default function Entry() {
	const clear = useWarnStore((s) => s.clear)
	return (
		<div className='cmp-warn-def-burger'>
			<button className='cmp-burger-wrapper cmp-warn-def-burger-close' onClick={onClick}>
				<img src='/img/close.svg' alt='close' />
			</button>
			<Menu />
		</div>
	)
	function onClick() {
		clear()
	}
}
