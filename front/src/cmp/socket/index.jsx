import useSocket from '@socket/useSocket'
import cInput from '@socket/on/c_input'
import cEquip from '@socket/on/c_equip'
import cAlarm from '@socket/on/c_alarm'
import cWarm from '@socket/on/c_warm'
import useEquipStore from '@store/equipment'
import useInputStore from '@store/input'


// Иницирование Socket подключения
export default function Socket({}) {
	const { initE } = useEquipStore()
	const { initIn, initAlr } = useInputStore()
	// Инициализация и Базовые обработчики
	useSocket()
	// Пользовательские обработчики
	// Склады и оборудование - для отрисовки складов
	cEquip(initE)
	// Входные данные от сервера Ангар (значения входов/выходов, настройки, режимы работы)
	cInput(initIn)
	// Аварийные сообщения
	cAlarm(initAlr)
	// Прогрев клапанов окончен (очистка задания, чтобы убрать кнопки прогрева)
	cWarm()
	return <></>
}
