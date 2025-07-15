import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'

//Кнопки ok и отмена
export default function Control({ data }) {
	const { clear } = useWarn(({ clear }) => ({ clear }))
	return (
		<div className='entry-control'>
			<div className='ec-yes-no'>
				<Btn
					title={'Да'}
					icon={!data.fnNo ? '/img/ok.svg' : ''}
					onClick={(_) => {
						clear()
						data.fnYes && data.fnYes()
					}}
				/>
				{data.fnNo && (
					<Btn title={'Нет'} onClick={(_) => (data.fnNo && data.fnNo(), clear())} />
				)}
			</div>
			<Btn title={'Отмена'} icon={'/img/cancel.svg'} onClick={clear} />
		</div>
	)
}
