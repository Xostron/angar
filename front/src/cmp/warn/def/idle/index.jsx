import { useEffect, useState } from 'react'
import useOutputStore from '@store/output'
import useInputStore from '@store/input'
import useWarn from '@store/warn'

import '../style.css'
import Title from './title'
import Control from './control'
import Field from './field'

//Управление вентилятором
export default function Entry({ data = {}, entryCode }) {
	const { title, obj, moreValue, setSettingAu, fnNo, fnYes } = data
	console.log(123, data)
	const clear = useWarn((s) => s.clear)
	// // Управление: вкл/выкл
	// const setO = useOutputStore((s) => s.setO)
	// // Вывести из работы
	// const setFan = useOutputStore((s) => s.setFan)
	// // Состояние ВНО: Выведен ли из работы ВНО, Состояние вентилятора
	// const { off = null, state = null } = useInputStore((s) => s.getFan({ _id }))

	// // Номер выхода (канала) вентилятора
	// const ch = module?.channel - 1
	// // Выбранное действие
	// const [sel, setSel] = useState(state)
	// // При обновлении
	// useEffect(() => {
	// 	setSel(state)
	// }, [_id])

	return (
		<div className='entry'>
			<Title name={title} />
			<Field moreValue={moreValue} idB={obj.build} codeStg={obj.type} />
			<Control cancel={fnNo} ok={fnYes} />
		</div>
	)

	// Ок
	function set() {
		// const cmd = sel === 'run' ? 1 : 0
		// if (sel === 'off' && !off)
		// 	setFan({ buildingId, sectionId, fanId: _id, action: sel, value: true })
		// else setFan({ buildingId, sectionId, fanId: _id, action: sel, value: false })
		// setO({ idB: buildingId, idM: module.id, value: cmd, channel: ch })
		clear()
	}
	// Отмена
	function cancel() {
		clear()
	}
	// Переключение радиокнопок
	function change(e) {
		// setSel(e.target.value)
	}
}
