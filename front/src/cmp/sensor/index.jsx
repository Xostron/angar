import Item from './item'
import def from '@src/tool/icon'
import './style.css'

//Группа датчиков склада
export default function Sensor({ data, cls, withImg = false }) {
	let cl = ['gr-sens', cls]
	cl = cl.join(' ')
	return (
		<section className={cl}>
			{data?.length &&
				data.map((el, i) => {
					const imgF = def.fan?.[el?.fan?.state]
					return (
						<div key={i}>
							<Item data={el} />
							{withImg && <Fan img={imgF} />}
						</div>
					)
				})}
		</section>
	)

	function Fan({ img }) {
		return (
			<div className='gr-sens-fan'>
				{!!img ? <img className={'gr-sens-fan-img'} src={img} /> : <span className='gr-sens-empty'></span>}
			</div>
		)
	}
}
