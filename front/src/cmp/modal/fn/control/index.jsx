import Btn from '@cmp/fields/btn'

//Кнопки ОК и отмена
export default function Control({ cancel, ok }) {
	return (
		<div className='ef-control'>
			<Btn
				cls='btn_turn'
				title={'ОК'}
				icon={'/img/ok.svg'}
				onClick={(_) => {
					ok()
					cancel(null)
				}}
			/>
			<Btn cls='btn_turn' title={'Отмена'} icon={'/img/cancel.svg'} onClick={cancel} />
		</div>
	)
}
