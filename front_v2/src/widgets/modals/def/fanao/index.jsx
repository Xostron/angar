import { useState, useEffect } from 'react';
import useOutputStore from '@src/entities/store/output';
import Button from '@src/shared/ui/button/btn';
import InputNum from '@src/shared/ui/input';
import style from './style.module.css';
import useAuthStore from '@src/entities/store/auth';
import useInputStore from '@src/entities/store/input';
const _MIN_VALUE = 20;

/**
 * Выключить склад
 * @param { object } props
 * @param {string} props.idB
 * @param {string} props.idS
 * @param {string} props.value Значение режима
 * @returns
 */
export default function fanao({ idB, idS, data, closeModal, refDialog }) {
  //   console.log(11, idB, idS, data);
  const ch = data?.module?.channel - 1;
  const isAuth = useAuthStore((s) => s.isAuth);
  const setO = useOutputStore((s) => s.setO);
  const setFan = useOutputStore((s) => s.setFan);
  const modeS = useInputStore(
    (s) => s.input?.innerSec?.[idB]?.[idS]?.mode?.[0],
  );
  // Задание spO: процент открытия
  const [spO, setSpO] = useState(data?.value ?? 0);
  const [flagSp, setFlagSp] = useState(false);
  //   Команда клапана
  const [sel, setSel] = useState(data.state);

  return (
    <div className={style.container}>
      <h2 className={style.header}>{data.name}</h2>
      {data?.ao?.channel && (
        <ul className={style.description}>
          <li>
            Включить: выберите режим «ВКЛ», введите значение от 20% до 100% в
            поле процента и нажмите «ОК».
          </li>
          <li>Выключить: выберите режим «ВЫКЛ» и нажмите «ОК».</li>
          <li>
            Вывести из работы (ввести в работу): выберите режим режим и нажмите
            «ОК». Отключает работу вентилятора в автоматическом режиме
          </li>
        </ul>
      )}
      <span className={style.text2}>Выберите режим работы</span>
      <div className={style.buttons_mode}>
        {[
          { code: 'run', name: 'ВКЛ' },
          { code: 'stop', name: 'ВЫКЛ' },
          { code: 'off', name: 'Вывести из работы' },
        ].map((el) => (
          <Button
            key={el.code}
            label={
              el.code == 'off' && data.state == 'off'
                ? 'Ввести в работу'
                : el.name
            }
            active={el.code.includes(sel)}
            onClick={() => {
              setSel(el.code);
            }}
            variant="grow"
            disabled={!isAuth || (el.code != 'off' && modeS === true)}
          />
        ))}
      </div>

      {data?.ao?.channel && (
        <div className={style.ao}>
          <span className={style.text}>
            Введите процент скорости вентилятора
          </span>
          <InputNum
            cls={style.input}
            type="number"
            min={0}
            max={100}
            value={spO}
            setValue={(v) => {
              setSpO(v);
              setFlagSp(true);
            }}
            placeholder={0}
            unit="%"
            keyboardContainer={refDialog?.current}
            disabled={!isAuth || sel != 'run' || modeS === true}
          />
        </div>
      )}
      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="grow"
          disabled={!isAuth}
        />
        <Button
          label="ОК"
          active={true}
          onClick={() => {
            closeModal();
            data?.ao?.channel ? fnOK() : fnOKwithoutAO();
          }}
          variant="grow"
          disabled={!isAuth}
        />
      </div>
    </div>
  );

  // Ok - Записать в стор команду управления
  function fnOK() {
    const cmd = sel === 'run' ? 1 : 0;
    // Вывести из работы
    if (sel === 'off' && data.state !== 'off') {
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: true,
        setpoint: _MIN_VALUE,
		// для массового вывода из работы
        _ids: data._ids,
      });
    }
    // ввод в работу
    else if (sel === 'off' && data.state == 'off') {
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: false,
        setpoint: _MIN_VALUE,
        _ids: data._ids,
      });
    }
    // Включить
    else if (sel == 'run') {
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: false,
        setpoint: spO <= 0 ? _MIN_VALUE : spO,
      });
    }
    // Выключить
    else {
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: false,
        setpoint: flagSp && spO > 0 ? spO : _MIN_VALUE,
      });
    }

    const out = { idB, idM: data?.module?.id, value: cmd, channel: ch };
    const outAO = {
      idB,
      idM: data?.ao?.id,
      //   value: sel == 'run' ? spO : _MIN_VALUE,
      value: (flagSp && spO > 0) || sel == 'run' ? spO : _MIN_VALUE,
      channel: data?.ao?.channel - 1,
    };

    // Блокировка включения при 0%
    if (sel == 'run' && spO <= 0) {
      console.log('Блокировка включения при 0%');
      return;
    }

    setO(out, outAO);
  }

  function fnOKwithoutAO() {
    const cmd = sel === 'run' ? 1 : 0;
    // Вывести из работы
    if (sel === 'off' && data.state !== 'off')
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: true,
      });
    // Включить
    else if (sel == 'run')
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: false,
      });
    // Выключить
    else
      setFan({
        buildingId: idB,
        sectionId: idS,
        fanId: data._id,
        action: sel,
        value: false,
      });

    const out = { idB, idM: data?.module?.id, value: cmd, channel: ch };

    setO(out);
  }
}
