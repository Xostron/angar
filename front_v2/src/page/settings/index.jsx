import { useNavigate, useParams } from 'react-router-dom';
import useOutputStore from '@src/entities/store/output';
import useInputStore from '@src/entities/store/input';
import useEquipStore from '@src/entities/store/equipment';
import { useShallow } from 'zustand/react/shallow';
import style from './style.module.css';
import Menu from './menu';
import def from './def';

export default function SettingsPage() {
  const { buildingId: idB, type } = useParams();
  // Склад
  const bld = useEquipStore((s) => s.getBld(idB));
  // Меню настроек
  const kindList = bld?.kindList;
  const bldType = bld?.type;
  const equipSect = bld?.section;

  // ***************** Калибровка клапанов *****************
  const setTune = useOutputStore((s) => s.setTune);
  const tune = useOutputStore((s) => s.tune);
  const sendTune = useOutputStore((s) => s.sendTune);
  //   Пользовательские значения калибровки
  const inputStore = useInputStore((s) => s?.input);
  const retainTune = inputStore?.retain?.[idB]?.valve;
  // Изменение, запись настроек, было ли изменение(для подсветки измененных значений)
  const setSettingAu = useOutputStore((s) => s.setSettingAu);
  const delRowSettingAu = useOutputStore((s) => s.delRowSettingAu);
  const sendSettingAu = useOutputStore((s) => s.sendSettingAu);
  const hasChanged = useOutputStore((s) => s.hasChangedSettingAu(idB, type));

  //   Продукт склада
  const curPrd = useInputStore((s) => s.input?.retain?.[idB]?.product?.code);
  // Продукт для просмотра
  const prd = useOutputStore((s) => s?.prd);

  const getValueSetting = useInputStore((s) => s?.getValueSetting);
  // Продукт склада

  // ***************** Спрятанные настройки *****************
  // skip - настройки которые необходимо скрыть|показать
  const skip = useOutputStore(
    useShallow((s) => s?.getSkip(idB, type, inputStore)),
  );
  //   // Заводские настройки - Рама
  const fct = useEquipStore((s) => s.getFactory(skip, type, prd?.code, curPrd));
  //   // Окно подтверждения сохранения
  //   const navigate = useNavigate();
  // При переключении по навигации
  // const setLink = useWarn((s) => s.setLink)
  // При переключении по навигации настроек
  // const warn = useWarn((s) => s.warn)

  // const obj = {
  // 	type: 'warn',
  // 	title: `Сохранение`,
  // 	text: `Сохранить настройки?`,
  // 	default() {
  // 		navigate(this.path)
  // 	},
  // 	fnYes() {
  // 		sendSettingAu()
  // 		this.default()
  // 	},
  // 	fnNo() {
  // 		setSettingAu(null)
  // 		this.default()
  // 	},
  // }

  // useEffect(() => {
  // 	setLink({ action: onDialog, hasChanged: hasChanged })
  // 	return () => setLink(null)
  // }, [hasChanged])

  // ***************** Экран - Меню *****************
  if (type === 'general') return <Menu />;

  // ***************** Экраны - Настроек *****************
  // const o = {
  // 	fct,
  // 	bldType,
  // 	type,
  // 	idB,
  // 	equipSect,
  // 	retainTune,
  // 	tune,
  // 	prd: prd?.code,
  // 	curPrd,
  // }

  // // const data = rack(o, stgV, delRowSettingAu, setSettingAu, sendSettingAu, sendTune, onSwitch)
  // // ***************** Стили *****************
  // const sumStg = kindList.length + def.length
  // const { st, stl, sth, stn } = sty(data, sumStg)
  return <main className={style.main}></main>;
}
