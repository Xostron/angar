import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'

//Кнопки ok и отмена
export default function Control({ data }) {
	const cancel = useWarn(({ cancel }) => cancel)
	// icon={'/img/ok.svg'}
	// icon={'/img/cancel.svg'}
	return (
		<div className='entry-control'>
			<div className='ec-yes-no'>
				<Btn title={'Да'} icon={!data.noaction ? '/img/ok.svg' : ''} onClick={(_) => (data.action(), cancel())} />
				{data.noaction && <Btn title={'Нет'} onClick={(_) => (data.noaction(), cancel())} />}
			</div>
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={cancel} />
		</div>
	)
}
