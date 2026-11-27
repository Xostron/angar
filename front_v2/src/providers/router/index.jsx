import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import MainPage from '../../page/main';
import BuildingPage from '../../page/building';
import SectionPage from '../../page/section';
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
      { index: true, element: <MainPage />, handle: { title: 'Мои склады' } },
      {
        path: 'building/:buildingId',
        element: <BuildingPage />,
        handle: { title: 'Склад' },
      },
      {
        path: 'building/:buildingId/section/:sectionId',
        element: <SectionPage />,
        handle: { title: 'Секция' },
      },
      {
        path: 'building/:buildingId/sensor/:type',
        element: <SensorPage />,
        handle: { title: 'Датчики' },
      },
      {
        path: 'building/:buildingId/signal',
        element: <SignalPage />,
        handle: { title: 'Сигналы' },
      },
      {
        path: 'building/:buildingId/report',
        element: <ReportPage />,
        handle: { title: 'Отчеты' },
      },
      {
        path: 'building/:buildingId/settings/:type',
        element: <SettingsPage />,
        handle: { title: 'Настройки' },
      },
      { path: 'test', element: <PageTest />, handle: { title: 'Тест' } },
      { path: '*', element: <NotFoundPage />, handle: { title: '' } },
    ],
  },
]);

export default router;
