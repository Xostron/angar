import Building from '@page/building'
import Report from '@page/report'
import Section from '@page/section'
import Sensor from '@page/sensor'
import Settings from '@page/settings'
import Signal from '@page/signal'
import NotFound from '@page/404'
import BuildOrSect from '@page/build_or_sect'
import Service from '@page/service'
import RouterError from '@cmp/router-error'
import BuildOrSect2 from '@page/build_or_sect/index2'

//Роутинг склада
const building = [
	{
		path: '',
		element: <BuildOrSect />,
		errorElement: <RouterError />,
		children: [
			{
				path: '',
				element: <Building />,
				errorElement: <RouterError />,
			},
			{
				path: 'section/:sect',
				element: <Section />,
				errorElement: <RouterError />,
			},
		],
	},
	{
		path: 'sensor/:sect',
		element: <Sensor />,
		errorElement: <RouterError />,
	},
	{
		path: 'signal',
		element: <Signal />,
		errorElement: <RouterError />,
	},
	{
		path: 'settings/:type',
		element: <Settings />,
		errorElement: <RouterError />,
	},
	{
		path: 'report',
		element: <Report />,
		errorElement: <RouterError />,
	},
	{
		path: 'service/:type',
		element: <Service />,
		errorElement: <RouterError />,
	},
	{
		path: '*',
		element: <NotFound />,
	},
];


export default building;
