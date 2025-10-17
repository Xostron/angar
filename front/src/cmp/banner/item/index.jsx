import '../style.css'
import defImg from '@tool/icon'

export default function Item({ data }) {
	if (!data) return null
	const img = defImg.alarm?.[data?.code]
	return (
		<div className={'banner-item'}>
			<img alt='' src={img} />
			{data?.msg}
		</div>
	)
}
