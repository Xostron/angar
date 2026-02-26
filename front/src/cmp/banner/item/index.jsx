import '../style.css'
import defImg from '@tool/icon'

export default function Item({ data }) {
	if (!data) return null
	const img = defImg.alarm?.[data?.code]
	console.log(111111,data )
	return (
		<div className={'banner-item'}>
			<img alt='' src={img} />
			{data?.msg}
		</div>
	)
}
