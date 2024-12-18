import useEquipStore from '@store/equipment'
import './style.css'

export default function Region() {
	const { list } = useEquipStore()
	const address = list?.[0]?.company?.address
	return (
		<div className='mw-region'>
			<div className='mwr-left'>
				<span>{address || 'Волгоградская обл.'}</span>
				<div className='mwrl-info'>
					<div>
						<span>{'Ощущается +25°'}</span>
						<span>{'Влажность 38 %'}</span>
					</div>
					<span>+28°</span>
				</div>
			</div>
			<div className='mwr-right'>
				<img src='img/wea.svg' alt='' />
			</div>
		</div>
	)
}
