import Building from '@page/building';
import Report from '@page/report';
import Section from '@page/section';
import Sensor from '@page/sensor';
import Settings from '@page/settings';
import Signal from '@page/signal';
import NotFound from '@page/404';

//Роутинг склада
const building = [
	{
		path:'section/:sect',
		element: <Section/>,
	},
	{
		path:'sensor/:sect',
		element: <Sensor/>,
	},
	{
		path:'signal',
		element: <Signal/>,
	},
	{
		path:'settings/:type',
		element: <Settings/>,
	},
	{
		path:'report',
		element: <Report/>,
	},
	{
		path:'',
		element:<Building/>
	},
	{
		path: '*',
		element: <NotFound />
	}
]

export default building