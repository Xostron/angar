import { useState, useEffect } from 'react';
import useOutputStore from '@src/entities/store/output';
import Button from '@src/shared/ui/button/btn';
import InputNum from '@src/shared/ui/input';
import style from './style.module.css';
import useAuthStore from '@src/entities/store/auth';
import useInputStore from '@src/entities/store/input'

/**
 * Выключить склад
 * @param { object } props
 * @param {string} props.idB
 * @param {string} props.idS
 * @param {string} props.value Значение режима
 * @returns
 */
export default function Valve({ idB, idS, data, closeModal, refDialog }) {
  //   console.log(11, idB, data);
  const isAuth = useAuthStore((s) => s.isAuth);
  const setO = useOutputStore((s) => s.setO);
  const setT = useOutputStore((s) => s.setT);
  const sendTune = useOutputStore((s) => s.sendTune);
  const modeS = useInputStore(
    (s) => s.input?.innerSec?.[idB]?.[idS]?.mode?.[0],
  );
  // Задание spO: процент открытия
  const [spO, setSpO] = useState(data?.value ?? 0);
  //   Флаг для блокиорвки кнопок, если есть изменения в поле процент открытия
  const [flagSp, setFlagSp] = useState(false);
  //   Команда клапана
  const [sel, setSel] = useState(data.state);

  useEffect(() => {
    flagSp ? setSel(null) : setSel(data.state);
  }, [flagSp]);

  return (
    <div className={style.container}>
      <h2 className={style.header}>{data.name} клапан</h2>
      <ul className={style.description}>
        <li>
          Полное открытие / закрытие: выберите нужный режим («Открыть»,
          «Закрыть» или «Стоп») и нажмите «ОК».
        </li>
        <li>
          Открытие на заданный угол: введите значение 0..100% в поле процента
          (кнопки выбора режима автоматически заблокируются) и нажмите «ОК».
        </li>
      </ul>
      <span className={style.text2}>Выберите режим работы</span>
      <div className={style.buttons_automode}>
        {[
          { code: 'iopn opn', name: 'Открыть' },
          { code: 'icls cls', name: 'Закрыть' },
          { code: 'stop', name: 'Стоп' },
        ].map((el) => (
          <Button
            key={el.code}
            label={el.name}
            active={el.code.includes(sel)}
            onClick={() => {
              setSel(el.code);
            }}
            variant="grow"
            disabled={flagSp || !isAuth || modeS === true}
          />
        ))}
      </div>

      <span className={style.text}>Введите процент открытия клапана</span>
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
        disabled={!isAuth || modeS === true}
      />

      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="grow"
          disabled={!isAuth || modeS === true}
        />
        <Button
          label="ОК"
          active={true}
          onClick={() => {
            closeModal();
            data.valve.forEach((vlv) => fnOK(data, vlv));
          }}
          variant="grow"
          disabled={!isAuth || modeS === true}
        />
      </div>
    </div>
  );

  // Ok - Записать в стор команду управления
  function fnOK(data, vlv) {
    // Перевод положения клапана в процентах -> в время, мс
    const timeSP = vlv?.calibration
      ? ((spO * vlv?.calibration) / 100).toFixed()
      : null;

    // Номер канала
    const chOn = vlv?.module?.on?.channel - 1;
    const chOff = vlv?.module?.off?.channel - 1;

    let cmd = null;
    let close = null;
    let tCmd = null;

    if (sel === 'stop') {
      close = {
        idB,
        idM: vlv.module.off.id,
        value: 0,
        channel: chOff,
        sel,
      };
      cmd = { idB, idM: vlv.module.on.id, value: 0, channel: chOn, sel };
    }
    if (sel === 'iopn opn') {
      close = {
        idB,
        idM: vlv.module.off.id,
        value: 0,
        channel: chOff,
        sel,
      };
      cmd = { idB, idM: vlv.module.on.id, value: 1, channel: chOn, sel };
    }
    if (sel === 'icls cls') {
      close = {
        idB,
        idM: vlv.module.off.id,
        value: 1,
        channel: chOff,
        sel,
      };
      cmd = { idB, idM: vlv.module.on.id, value: 0, channel: chOn, sel };
    }
    console.log(123, spO);
    if (sel === null) {
      if (spO > data.value) {
        cmd = {
          idB,
          idM: vlv.module.off.id,
          value: 0,
          channel: chOff,
          sel,
          setpoint: spO,
        };
        tCmd = {
          idB,
          idM: vlv.module.on.id,
          value: 1,
          channel: chOn,
          time: timeSP,
          _id: vlv._id,
          type: 'on',
          sel,
        };
      }
      if (spO < data.value) {
        cmd = {
          idB,
          idM: vlv.module.on.id,
          value: 0,
          channel: chOn,
          sel,
          setpoint: spO,
        };
        tCmd = {
          idB,
          idM: vlv.module.off.id,
          value: 1,
          channel: chOff,
          time: timeSP,
          _id: vlv._id,
          type: 'off',
          sel,
        };
      }
    }

    if (cmd) setO(cmd, close, 'valve', vlv._id);
    if (tCmd) setT(tCmd);
    sendTune();
    closeModal();
  }
}
