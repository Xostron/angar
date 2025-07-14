import Btn from '@cmp/fields/btn'

//Кнопки ok и отмена
export default function Control({ data, cancel }) {

	return (
		<div className='entry-control'>
			<div className='ec-yes-no'>
				<Btn
					title={'Да'}
					icon={!data.noaction ? '/img/ok.svg' : ''}
					onClick={(_) => (data.action(), cancel())}
				/>
				{data.noaction && (
					<Btn title={'Нет'} onClick={(_) => (data.noaction(), cancel())} />
				)}
			</div>
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={cancel} />
		</div>
	)
}
