import { useEffect, useState } from 'react'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'
import Control from '../../../modal/fn/control'
import Field from './field'
import Title from '../../../modal/fn/title'
import '../style.css'

// Управление обогревателем клапанов
export default function Entry({ data = {}, entryCode  }) {
	const { _id, sectionId, module, build, state } = data
		const { clear } = useWarn(({ clear }) => ({ clear }))
	const { setO } = useOutputStore()
	const input = useInputStore(({ input }) => input)

	// Текущее значение выхода
	const ch = module?.channel - 1
	const on = input?.output?.[module.id]?.[ch] == 1 ? 'on' : 'off'

	// Выбранное действие
	const [sel, setSel] = useState(on)
	// При обновлении
	useEffect(() => {
		setSel(on)
	}, [on, _id])

	return (
		<div className='entry'>
			<Title name='Обогреватель клапанов' />
			<Field sel={sel} change={change} />
			<Control cancel={cancel} ok={set} />
		</div>
	)

	// Ок
	function set() {
		const cmd = sel === 'on' ? 1 : 0
		setO({ idB: build, idM: module.id, value: cmd, channel: ch })
		clear()
	}
	// Отмена
	function cancel() {
		clear()
	}
	// Переключение радиокнопок
	function change(e) {
		setSel(e.target.value)
	}
}
