import Btn from '@cmp/fields/btn'

export default function Footer({ act1, act2, act3, name, bType }) {
	return (
		<div className='line' style={{ justifyContent: 'space-between' }}>
			<div className='left'>
				<Btn title={name} cls='btn_turn' icon='/img/ok.svg' onClick={act1} />
				<Btn title='Отмена' cls='btn_turn' icon='/img/cancel.svg' onClick={act2} />
			</div>
			{bType!='cold' ? (
				<div className='right'>
					<Btn title='Обнулить' cls='btn_turn' icon='/img/repeat.svg' onClick={act3} />
				</div>
			) : (
				<></>
			)}
		</div>
	)
}
