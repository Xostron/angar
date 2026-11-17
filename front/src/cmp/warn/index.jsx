import { useEffect } from 'react'
import useWarnStore from '@store/warn'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/hook'
import def from './def'

// Фабричный компонент модальных окон
export default function Warn({}) {
	const { refDialog, open, close, isOpen } = useDialog()
	const data = useWarnStore((s) => s.data)
	const show = useWarnStore((s) => s.show)
	const entryCode = useWarnStore((s) => s.entryCode)
	// Use useEffect to manage dialog state to prevent calling showModal on already open dialogs
	useEffect(() => {
		if (show && !isOpen) {
			open()
		} else if (!show && isOpen) {
			close()
		}
	}, [show, isOpen, open, close])

	const Entry = def[entryCode] ?? def.notfound

	return (
		<Dialog href={refDialog} cls={data.cls ?? ''}>
			<Entry data={data} entryCode={entryCode} refDialog={refDialog} />
		</Dialog>
	)
}
