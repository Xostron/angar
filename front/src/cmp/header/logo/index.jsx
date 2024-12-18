import './style.css'

//Логотип сайта + Перезагрузка страницы при клике
export default function Logo({}) {

	return <img 
		src="/img/logo.svg" 
		alt="" 
		className='logo' 
		onClick={()=>window.location.reload(false)}
	/>
}