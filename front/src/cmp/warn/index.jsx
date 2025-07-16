import useWarn from '@store/warn'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/hook'
import def from './def'

// Предупреждение и информирование
export default function Warn({}) {
	const { refDialog, open, close } = useDialog()
	const { clear, data, show, entryCode } = useWarn(({ clear, data, show, entryCode }) => ({
		clear,
		data,
		show,
		entryCode,
	}))
	show ? open() : close()
	const Entry = def[entryCode] ?? def.notfound
	return (
		<Dialog href={refDialog}>
			<Entry data={data} entryCode={entryCode} />
		</Dialog>
	)
}
