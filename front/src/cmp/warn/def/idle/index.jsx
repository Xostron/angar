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
	const { title, obj, moreValue, setSettingAu, sendSettingAu, fnNo, fnYes, markCode } = data

	const clear = useWarn((s) => s.clear)

	return (
		<div className='entry'>
			<Title name={title} />
			<Field data={data} />
			<Control cancel={cancel} ok={fnYes} />
		</div>
	)

	// Отмена
	function cancel() {
		clear()
	}
	// Переключение радиокнопок
	function change(e) {
		// setSel(e.target.value)
	}
}
