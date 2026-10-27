import IconText from '@cmp/fields/icon_text'
import Input from '@cmp/fields/input'
import Popup from '@cmp/fields/popup'
import Switch from '@cmp/fields/switch'
import Text from '@cmp/fields/text'
import { useState, useEffect } from 'react'
import useInputStore from '@store/input'
import useOutputStore from '@store/output'
import { useParams } from 'react-router-dom'
import BtnHid from './btn_hid'
import More from '@src/cmp/fields/more'

//Ячейка таблицы настроек
export default function Cell({ data, i, j }) {
	const { type, build } = useParams()
	const { settingAu, prd, hid } = useOutputStore()
	const val = {}
	// Код ячейки = mark._code + '.' + ml._code
	const code = data?.code?.split('.')

	// Значение настройки пользователя retain
	val[data.code] = useInputStore((s) => s.getValueSetting(code, build, type, prd))
	// Значение поля
	const [value, setValue] = useState(val?.[data.code] ?? '')

	useEffect(() => {
		setValue(val?.[data.code] ?? data?.factory ?? '')
	}, [type, prd])

	// console.log(11, data, value)
	// Подсветка - Изменение поля
	let hasChanged
	if (code?.length === 2) hasChanged = !!settingAu?.value?.[code[0]]?.[code[1]]
	else hasChanged = !!settingAu?.value?.[data.code]
	let cl = ['cell-w']
	if (hasChanged) cl.push('changed')
	cl = cl.join(' ')
	const st = { gridArea: `${1 + i}/${1 + j}/${2 + i}/${2 + j}` }
	// console.log(11, value, data.code)
	switch (data.field) {
		case 'text':
			return <Text cls='cell-w' data={data} style={st} />
		case 'iconText':
			return <IconText cls='cell-w' data={data} style={st} title={data.code} />
		case 'input':
			return (
				<Input
					cls={cl}
					type={data.type}
					min={data.min}
					max={data.max}
					step={data.step}
					value={value}
					// disabled={disabled}
					setValue={(val) => {
						setValue(val)
						data.setValue(val)
					}}
					style={st}
					title={data.code}
				/>
			)
		case 'switch':
			return (
				<Switch
					cls='cell-w'
					value={value}
					setValue={data.setValue}
					style={st}
					title={data.code}
				/>
			)
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
					title={data.code}
				/>
			)
		case 'title':
			return <Title data={data} st={st} cl={cl} />

		case 'head':
			return (
				<div className='usual' style={st}>
					{data.value}
				</div>
			)
		case 'info':
			return (
				<div className='info' style={st}>
					{data.value}
				</div>
			)

		case 'more':
			return <More data={{ ...data }} style={st} />

		default:
			return <Text cls='cell-w' data={data} style={st} />
	}
}

function Title({ data, st, cl }) {
	return (
		<div className='title' style={st}>
			<span className='title-span'>{data.value}</span>
			{data.nameHid && <BtnHid style={st} cls={cl} nameHid={data?.nameHid} />}
		</div>
	)
}

// val[data.code] = useInputStore(({ input }) => {
// 	if (!code) return null
// 	if (
// 		[
// 			'antibliz',
// 			'heating',
// 			'overVlv',
// 			'accel',
// 			'idle',
// 			'co2',
// 			'ozon',
// 			'heater',
// 			'smoking',
// 			'demo',
// 			'heattcnl',
// 		].includes(type)
// 	) {
// 		// Без продукта
// 		if (code?.length === 1) return input?.retain?.[build]?.setting?.[type]?.[code[0]]
// 		if (code?.length === 2)
// 			return input?.retain?.[build]?.setting?.[type]?.[code[0]]?.[code[1]]
// 	} else {
// 		// С продуктом
// 		if (code?.length === 1)
// 			return input?.retain?.[build]?.setting?.[type]?.[prd?.code]?.[code[0]]
// 		if (code?.length === 2)
// 			return input?.retain?.[build]?.setting?.[type]?.[prd?.code]?.[code[0]]?.[code[1]]
// 	}
// })
