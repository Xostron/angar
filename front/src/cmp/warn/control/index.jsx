import Btn from '@cmp/fields/btn'

//Кнопки ok и отмена
export default function Control({ data, cancel }) {
	return (
		<div className='entry-control'>
			<div className='ec-yes-no'>
				<Btn title={'Да'} icon={!data.fnNo ? '/img/ok.svg' : ''} onClick={(_) => (data.fnYes && data.fnYes(), cancel())} />
				{data.fnNo && <Btn title={'Нет'} onClick={(_) => (data.fnNo && data.fnNo(), cancel())} />}
			</div>
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={cancel} />
		</div>
	)
}
