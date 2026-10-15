import useViewStore from '@store/view'
import './style.css'

//Логотип сайта + Перезагрузка страницы при клике
export default function Logo() {
	const mb = useViewStore((s) => s.mb())
	const cls = ['logo', mb].join(' ')
	const handleHardReload = (e) => {
		e.preventDefault() // Отменяем стандартный переход по ссылке
		
		// Генерируем уникальный таймстэмп для обхода кэша
		const cacheBuster = `?t=${Date.now()}`
		
		// Перенаправляем на главную с уникальным параметром
		window.location.href = '/' + cacheBuster
	}
	return (
		<img
			src='/img/logo.svg'
			alt=''
			className={cls}
			onClick={handleHardReload}
		/>
	)
}
