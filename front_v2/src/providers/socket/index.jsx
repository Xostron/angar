import useSocket from '@src/shared/api/socket/useSocket';
import useRemoteSockets from '@src/shared/api/socket/useRemoteSockets';
import cInput from '@src/shared/api/socket/on/c_input';
import cEquip from '@src/shared/api/socket/on/c_equip';
import cAlarm from '@src/shared/api/socket/on/c_alarm';
import cWarm from '@src/shared/api/socket/on/c_warm';
import useEquipStore from '@src/entities/store/equipment';
import useInputStore from '@src/entities/store/input';

// Иницирование Socket подключения
export default function Socket({}) {
  const { initE } = useEquipStore();
  const { initIn, initAlr } = useInputStore();
  // Инициализация и Базовые обработчики
  useSocket();
  // Подключения к удалённым устройствам по IP
  useRemoteSockets();
  // Пользовательские обработчики
  // Склады и оборудование - для отрисовки складов
  cEquip(initE);
  // Входные данные от сервера Ангар (значения входов/выходов, настройки, режимы работы)
  cInput(initIn);
  // Аварийные сообщения
  cAlarm(initAlr);
  // Прогрев клапанов окончен (очистка задания, чтобы убрать кнопки прогрева)
  cWarm();
  return <></>;
}
