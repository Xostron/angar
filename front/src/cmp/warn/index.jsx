import useWarn from '@store/warn'
import Control from './control'
import Title from './title'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/use_dialog'

///Предупреждение и информирование
export default function Warn({}) {
	const { refDialog, open, close } = useDialog()
	const { data, show } = useWarn(({ data, show }) => ({ data, show }))
	if (show) open()
	else close()

	const { type = 'info', title, text, action } = data
	const icon = type === 'info' ? '/img/info.svg' : '/img/warn.svg'
	return (
		<Dialog href={refDialog}>
			<div className='entry'>
				<Title icon={icon} title={title} />
				<p>{text}</p>
				<Control data={data} />
			</div>
		</Dialog>
	)
}
