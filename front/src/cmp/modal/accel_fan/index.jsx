import { useEffect, useState } from 'react'
import Control from '../fn/control'
import Field from './field'
import Title from '../fn/title'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import '../style.css'

// Управление разгонным вентилятором
export default function Entry({ data = {}, setData, close }) {
	const { _id, name, module, build, } = data
	const { setO } = useOutputStore()
	const input = useInputStore(({ input }) => input)

	// Текущее значение выхода
	const ch = module?.channel - 1
	const on = input?.output?.[module.id]?.[ch] == 1 ? 'run' : 'stop'

	// Выбранное действие
	const [sel, setSel] = useState(on)
	// При обновлении
	useEffect(() => {
		setSel(on)
	}, [on, _id])

	return (
		<div className='entry'>
			<Title name={name} />
			<Field sel={sel} change={change} />
			<Control cancel={cancel} ok={set} />
		</div>
	)

	// Ок
	function set() {
		const cmd = sel === 'run' ? 1 : 0
		setO({ idB: build, idM: module.id, value: cmd, channel: ch })
		close()
	}
	// Отмена
	function cancel() {
		setData(null)
		close()
	}
	// Переключение радиокнопок
	function change(e) {
		setSel(e.target.value)
	}
}
