import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import useEquipStore from "@store/equipment";
import useOutputStore from "@store/output";
import useInputStore from "@store/input";
import useWarn from "@store/warn";
import List from "./list";
import Menu from "./menu";
import Nav from "./nav";
import "./style.css";
import SubHead from "./sub_head";
import { rack, sty } from "./fn";
import def from "./def";

//Настройки склада
export default function Settings({}) {
  const { type, build } = useParams();
  const [curB, kindList] = useEquipStore(({ getCurB, getKindList }) => [getCurB(build), getKindList(build)]);

  // ***************** Калибровка клапанов *****************
  const [bldType, equipSect] = useEquipStore(({ list }) => [list?.[curB]?.type, list?.[curB]?.section]);

  // Изменение и запись настроек
  const [setTune, tune, sendTune, setSettingAu, sendSettingAu, hasChangedSettingAu, prd, hid] = useOutputStore(
    ({ setTune, tune, sendTune, setSettingAu, sendSettingAu, hasChangedSettingAu, prd, hid }) => [
      setTune,
      tune,
      sendTune,
      setSettingAu,
      sendSettingAu,
      hasChangedSettingAu,
      prd,
      hid?.[`${type}.text-collapse`]?.hid ?? true,
    ]
  );

  const [retainTune, coef, factory, retain, curPrd] = useInputStore(({ input }) => [
    input?.retain?.[build]?.valve,
    input.coef?.[build]?.[type],
    input?.factory,
    input?.retain?.[build]?.setting?.[type]?.[prd?.code],
    input?.retain?.[build]?.product?.code,
  ]);
  // Спрятанные настройки
  const skip = fnSkip(prd, factory?.[type], coef, retain);
  const show = fnAct(prd, factory?.[type], coef, retain);
  // Заводские настройки - рама
  const [fct] = useEquipStore(({ getFactory }) => [getFactory(type, hid, skip, prd?.code, curPrd)]);

  // Окно подтверждения сохранения
  const navigate = useNavigate();
  const warn = useWarn(({ warn }) => warn);
  const { setLink } = useWarn();

  const obj = {
    type: "warn",
    title: `Сохранение`,
    text: `Сохранить настройки?`,
    default() {
      navigate(this.path);
    },
    action() {
      sendSettingAu();
      this.default();
    },
    noaction() {
      setSettingAu(null);
      this.default();
    },
  };

  useEffect(() => {
    setLink({ action: onDialog, hasChanged: hasChangedSettingAu(build, type) });
    return () => {
      return setLink(null);
    };
  }, [hasChangedSettingAu(build, type)]);

  // ***************** Экран - Меню *****************
  if (type === "menu") return <Menu />;

  // ***************** Экраны - Настроек *****************
  const o = { fct, bldType, type, build, equipSect, retainTune, tune, hid, prd: prd?.code, curPrd, show };
  let data = rack(o, setSettingAu, sendSettingAu, sendTune, onSwitch);

  // ***************** Стили *****************
  const sumStg = kindList.length + def.length;
  const { st, stl, sth, stn } = sty(data, sumStg);

  return (
    <main className="sett" style={st}>
      <SubHead title={data.title} head={data.head} st={sth} warn={data.warn} />
      <List data={data} st={stl} />
      <Nav st={stn} cur={type} dialog={onDialog} hasChanged={hasChangedSettingAu(build, type)} />
    </main>
  );

  // Обработчик вызова окна
  function onDialog(path) {
    warn({ ...obj, path });
  }
  // Вкл/выкл калибровку клапанов - Обработчик Switch
  function onSwitch(vlv, val) {
    if (!val) {
      setTune({ ...vlv, _stage: null });
      return;
    }
    setTune({ ...vlv, _stage: "begin", _build: build });
  }
}

// Спрятанные настройки
function fnSkip(prd, factory, coef, retain) {
  let o = prd?.code ? factory?.[prd?.code] : null;
  let cf = coef ? Object.keys(coef) : null;
  return coef && o
    ? Object?.entries(o).reduce((acc, [code, val]) => {
        const nv = retain?.[code] ?? {};
        let o = {};
        if (!isNaN(val[cf?.[0]]) && !isNaN(val[cf?.[1]])) {
          o = { ...val, ...nv };
          const one = o[cf?.[0]] != coef[cf?.[0]]
		  const two = o[cf?.[1]] != coef[cf?.[1]]
          if ((one && two) || (one != two)) acc.push(code);
        }
        return acc;
      }, [])
    : null;
}

// Активная настройка
function fnAct(prd, factory, coef, retain) {
  let o = prd?.code ? factory?.[prd?.code] : null;
  let cf = coef ? Object.keys(coef) : null;
  return coef && o
    ? Object.entries(o).reduce((acc, [code, val]) => {
        const nv = retain?.[code] ?? {};
        let o = {};
        if (!isNaN(val[cf?.[0]]) && !isNaN(val[cf?.[1]])) {
          o = { ...val, ...nv };
          if (o[cf?.[0]] == coef[cf?.[0]] && o[cf?.[1]] == coef[cf?.[1]]) acc.push(code);
        }
        return acc;
      }, [])
    : null;
}
