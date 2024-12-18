import IconText from '@cmp/fields/icon_text'
import Input from '@cmp/fields/input'
import Popup from '@cmp/fields/popup'
import Switch from '@cmp/fields/switch'
import Text from '@cmp/fields/text'
import { useState, useEffect } from 'react'
import useInputStore from '@store/input'
import useOutputStore from '@store/output'
import { useParams } from 'react-router-dom'
//Ячейка таблицы настроек
export default function Cell({ data, i, j }) {
	const { type, build } = useParams()
	const { settingAu, prd } = useOutputStore()

	const val = {}
	// Код ячейки = mark._code + '.' + ml._code
	const code = data?.code?.split('.')
	val[data.code] = useInputStore(({ input }) => {
		if (!code) return null
		if (['antibliz', 'heating', 'overVlv', 'accel', 'idle', 'co2', 'ozon', 'heater', 'smoking'].includes(type)) {
			// Без продукта
			if (code?.length === 1) return input?.retain?.[build]?.setting?.[type]?.[data.code]
			if (code?.length === 2) return input?.retain?.[build]?.setting?.[type]?.[code[0]]?.[code[1]]
		} else {
			// С продуктом
			if (code?.length === 1) return input?.retain?.[build]?.setting?.[type]?.[prd?.code]?.[data.code]
			if (code?.length === 2) return input?.retain?.[build]?.setting?.[type]?.[prd?.code]?.[code[0]]?.[code[1]]
		}
	})
	// Значение поля
	const [value, setValue] = useState(val?.[data.code] ?? '')
	useEffect(() => {
		setValue(val?.[data.code] ?? data?.factory ?? '')
	}, [type, prd])

	// Подсветка - Изменение поля
	const name = data?.code?.split('.')
	let hasChanged
	if (name?.length === 2) hasChanged = !!settingAu?.value?.[name[0]]?.[name[1]]
	else hasChanged = !!settingAu?.value?.[data.code]
	let cl = ['cell-w']
	if (hasChanged) cl.push('changed')
	cl = cl.join(' ')

	const st = { gridArea: `${1 + i}/${1 + j}/${2 + i}/${2 + j}` }
	const field = data.field
	switch (field) {
		case 'text':
			return <Text cls='cell-w' data={data} style={st} />
		case 'iconText':
			return <IconText cls='cell-w' data={data} style={st} />
		case 'input':
			return (
				<Input
					cls={cl}
					type={data.type}
					min={data.min}
					max={data.max}
					step={data.step}
					value={value}
					setValue={(val) => {
						setValue(val)
						data.setValue(val)
					}}
					style={st}
				/>
			)
		case 'switch':
			return <Switch cls='cell-w' value={value} setValue={data.setValue} style={st} />
		case 'popup':
			return (
				<Popup
					data={{
						...data,
						value: data?.list?.find((el) => el.code === value)?.title ?? data.default,
						setValue: (val) => {
							setValue(val)
							data.setValue(val)
						},
					}}
					style={st}
				/>
			)
		case 'title':
			return (
				<div className='title' style={st}>
					{data.value}
				</div>
			)
		case 'head':
			return (
				<div className='usual' style={st}>
					{data.value}
				</div>
			)
		default:
			return <Text cls='cell-w' data={data} style={st} />
	}
}
