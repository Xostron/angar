import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import MainPage from '../../page/main';
import BuildingPage from '../../page/building';
import SensorPage from '../../page/sensor';
import SignalPage from '../../page/signal';
import ReportPage from '../../page/report';
import SettingsPage from '../../page/settings';
import NotFoundPage from '../../page/not-found';
import PageTest from '../../page/test';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'building/:buildingId', element: <BuildingPage /> },
      { path: 'building/:buildingId/sensor/:type', element: <SensorPage /> },
      { path: 'building/:buildingId/signal', element: <SignalPage /> },
      { path: 'building/:buildingId/report', element: <ReportPage /> },
      {
        path: 'building/:buildingId/settings/:type',
        element: <SettingsPage />,
      },
      { path: 'test', element: <PageTest /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
