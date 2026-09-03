import { useState } from 'react';
import Button from '../../shared/ui/button/btn';
import Toggle2 from '../../shared/ui/button/toggle_button_2';
import Toggle3 from '../../shared/ui/button/toggle_button_3';
import Switch from '../../shared/ui/button/switch';
import InputNum from '../../shared/ui/input';
import TextSens from '../../shared/ui/text/sensor';
import TextEquip from '@src/shared/ui/text/equipment';
import TextSensRow from '@src/shared/ui/text/sensor_row';
import WeatherRow from '@src/shared/ui/text/weather_row';
import IncidentBox from '@src/shared/ui/incident/box';
import IncidentJump from '@src/shared/ui/incident/jump';
import IncidentInline from '@src/shared/ui/incident/inline';

function PageTest({}) {
  // Toggle2
  const [on, setOn] = useState(false);
  //  Toggle3
  const [onn, setOnn] = useState(false);
  const [val1, setVal1] = useState('15');
  const optionsInNum = {
    disabled: false,
    readOnly: false,
    placeholder: 'Введите',
    title: 'For the Emperor',
  };
  return (
    <div style={style.main}>
      <article style={style.input}>
        <InputNum
          value={val1}
          setValue={setVal1}
          min={-15}
          max={100}
          {...optionsInNum}
        />
        <InputNum
          value={val1}
          setValue={setVal1}
          min={-15}
          max={100}
          {...optionsInNum}
          disabled={true}
        />

        <IncidentBox
          err={{
            msg: 'Абсолютная влажность улицы ниже допустимой',
            typeIncident: 'equipment',
            date: new Date().toLocaleString(),
            code: null,
          }}
        />
        <IncidentBox
          err={{
            msg: 'Абсолютная влажность улицы ниже допустимой',
            typeIncident: 'notification',
            date: new Date().toLocaleString(),
            code: null,
          }}
        />
        <IncidentBox
          err={{
            msg: 'Абсолютная влажность улицы ниже допустимой',
            typeIncident: 'warning',
            date: new Date().toLocaleString(),
            code: null,
          }}
        />
        <IncidentBox
          err={{
            msg: 'Абсолютная влажность улицы ниже допустимой',
            typeIncident: 'alarm',
            date: new Date().toLocaleString(),
            code: null,
          }}
        />
        <IncidentJump count={12} />
        <IncidentInline msg="t продукта в задании 12°С" />
        <IncidentInline msg="t продукта в задании 12°С" size="large" />
        <WeatherRow
          temp={21}
          hum={42}
          date="02.09.2026"
          code="cloudy"
          onClick={() => {}}
        />
        <WeatherRow />
        <TextSens name="Уличные датчики" />
        <TextSens name="Температура" value={-5} unit="grad" />
        <TextSens name="Температура" value={5} unit="grad" state="alarm" />
        <TextSens name="Температура" value={5} unit="grad" state="off" />
        <TextSens name="Абс. вл." value={10} unit="hum" />

        <TextEquip name="Разгон. вент." value={true} />
        <TextEquip name="Разгон. вент." value="off" />
        <TextEquip name="Разгон. вент." value="on" state="alarm" />
        <TextEquip name="Разгон. вент." value="time" state="off" />
        <TextEquip name="Разгон. вент." value="on" />
        <TextEquip name="Увлажнитель" value="off" />
        <TextEquip name="Озонатор" value="ожидание" />
        <TextEquip name="Окуривание" value="on" />
        <TextEquip name="Обогрев" value="sensor" />
        <TextEquip name="Контроль CO2" value="on" />

        <TextSensRow name="Темп." value={4} unit="grad" info />
        <TextSensRow name="Темп." value={-4} unit="grad" />
        <TextSensRow name="Темп." value={4} unit="grad" state="alarm" />
        <TextSensRow name="Темп." value={4} unit="grad" state="off" />
        <TextSensRow name="Продукта" value="Лук" />
        <TextSensRow name="Режим" value="Сушка" />
        <TextSensRow name="Продукта" value="Лук" info />
        <TextSensRow name="Режим" value="Сушка" info />
      </article>
      <article style={style.btn}>
        <Button
          label="Включить"
          variant="usual"
          active={true}
          disabled={false}
        />
        <Button
          label="Выключить"
          variant="usual"
          active={false}
          disabled={false}
        />
        <Button
          label="Включить"
          variant="usual"
          active={true}
          disabled={true}
        />
        <Button
          label="Выключить"
          variant="usual"
          active={false}
          disabled={true}
        />
        {/*  */}
        <Button
          label="Сушка"
          variant="automode"
          active={true}
          disabled={false}
        />
        <Button
          label="Сушка"
          variant="automode"
          active={false}
          disabled={false}
        />
        {/*  */}
        <Button label="Секция" variant="sect" active={true} disabled={false} />;
        <Button label="Секция" variant="sect" active={false} disabled={false} />
        <Button label="Секция" variant="sect" active={true} disabled={true} />;
        <Button label="Секция" variant="sect" active={false} disabled={true} />;
        <Toggle2
          value={on}
          on1={() => {
            setOn(false);
          }}
          on2={() => {
            setOn(true);
          }}
          disabled={false}
        />
        <Toggle2
          value={on}
          on1={() => {
            setOn(false);
          }}
          on2={() => {
            setOn(true);
          }}
          disabled={true}
        />
        {/*  */}
        <Toggle3
          value={onn}
          on1={() => {
            setOnn(false);
          }}
          on2={() => {
            setOnn(true);
          }}
          on3={() => {
            setOnn(null);
          }}
          disabled={false}
        />
        <Toggle3
          value={onn}
          on1={() => {
            setOnn(false);
          }}
          on2={() => {
            setOnn(true);
          }}
          on3={() => {
            setOnn(null);
          }}
          disabled={true}
        />
        <Switch
          value={on}
          onChange={() => setOn((prev) => !prev)}
          disabled={false}
        />
        <Switch
          value={on}
          onChange={() => setOn((prev) => !prev)}
          disabled={true}
        />
      </article>
    </div>
  );
}

export default PageTest;

const style = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    padding: '8px',
  },
  btn: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  input: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};
