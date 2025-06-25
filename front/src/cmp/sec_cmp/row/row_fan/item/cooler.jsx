import defUn from '@src/tool/unit'
import { useParams } from 'react-router-dom'
import useInputStore from '@store/input'

/**
 *
 * @param {object} data Рама испарителя
 * @returns
 */
export default function ItemCooler({ data, action, isAuth, cls }) {
	const { build } = useParams()
	// [Состояния и показания испарителя], [склад вкл/выкл]
	const [cooler, start] = useInputStore(({ input }) => [input?.[data?._id], input?.retain?.[build]?.start])
	// Состояние испарителя
	const state = cooler?.state
	// Стадия испарителя - режим
	const utxt = start ? cooler.name : ''
	// Задание ПЧ
	let ltxt = Object.values(cooler?.fan ?? {})?.[0]?.value
	if (ltxt !== undefined) ltxt = isNaN(ltxt) ? '-- %' : ltxt + '%'
	else ltxt = '-- %'
	// Температура всасывания
	const idT = data.sensor?.find((el) => el.type === 'cooler')?._id
	let t = cooler?.sensor?.[idT]?.value ?? '-'
	const rtxt = t != '-' ? t + ' ' + defUn?.temp : t

	let cl = ['cmp-sec-row-item', 'btn-cooler', cls]
	// Иконка состояния испарителя с ПЧ
	const img = `/img/cold/cooler/cooler-${state}.svg` ?? ''
	// Доступ разрешен
	if (isAuth) cl.push('auth-sir')

	cl = cl.join(' ')

	return <BtnCooler onClick={action} icon={img} ltxt={ltxt} rtxt={rtxt} utxt={utxt} cls={cl} />
}

// Кнопка Испаритель
function BtnCooler({ icon, onClick, ltxt = '', rtxt = '', utxt = '', cls, style }) {
	let cl = ['btn', cls]
	cl = cl.join(' ')

	return (
		<button onClick={onClick} className={cl} style={style}>
			<span>{ltxt}</span>
			<div>
				<span className='up'>{utxt}</span>
				<img src={icon} />
			</div>
			<span>{rtxt}</span>
		</button>
	)
}
