import ItemSec from './ph_section'
import ItemSen from './ph_sensor'

//Элемент навигации по секциям
export default function Item(props) {
	return props.ph === 'section' ? <ItemSec {...props} /> : <ItemSen {...props} />
}
