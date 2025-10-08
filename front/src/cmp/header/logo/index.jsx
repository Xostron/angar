import useViewStore from '@store/view'
import './style.css'
import {uri} from '@store/uri'

//Логотип сайта + Перезагрузка страницы при клике
export default function Logo({}) {
	const mb = useViewStore((s) => s.mb())
	const cls = ['logo', mb].join(' ')
	return (
		<img
			src='/img/logo.svg'
			alt=''
			className={cls}
			onClick={() => window.location.reload(true)}
			onDoubleClick={() => {
				console.log(111, uri)
				window.location.href = uri}
			}
		/>
	)
}
