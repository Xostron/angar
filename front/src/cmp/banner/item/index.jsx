import '../style.css'
import defImg from '@tool/icon'

export default function Item({ data }) {
	if (!data) return null
	console.log(555,data)
	const img = defImg.alarm?.[data?.code]
	return (
		<div className={'banner-item'}>
			<img alt='' src={img} />
			{data?.msg}
		</div>
	)
}
