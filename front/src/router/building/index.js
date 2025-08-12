import Building from '@page/building';
import Report from '@page/report';
import Section from '@page/section';
import Sensor from '@page/sensor';
import Settings from '@page/settings';
import Signal from '@page/signal';
import NotFound from '@page/404';
import BuildOrSect from '@page/build_or_sect';
import Service from '@page/service';
import RouterError from '@cmp/router-error';

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
		path: 'service',
		element: <Service />,
		errorElement: <RouterError />,
	},
	{
		path: '*',
		element: <NotFound />,
	},
];

//Роутинг склада
// const building = [
// 	{
// 		path:'',
// 		element:<Building/>
// 	},
// 	{
// 		path:'section/:sect',
// 		element: <Section/>,
// 	},
// 	{
// 		path:'sensor/:sect',
// 		element: <Sensor/>,
// 	},
// 	{
// 		path:'signal',
// 		element: <Signal/>,
// 	},
// 	{
// 		path:'settings/:type',
// 		element: <Settings/>,
// 	},
// 	{
// 		path:'report',
// 		element: <Report/>,
// 	},
// 	{
// 		path: '*',
// 		element: <NotFound />
// 	}
// ]

export default building;
