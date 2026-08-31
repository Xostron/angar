import { useState } from 'react';
import Button from '../../cmp/ui/button/btn';
import Toggle2 from '../../cmp/ui/button/toggle_button_2';
import Toggle3 from '../../cmp/ui/button/toggle_button_3';
import Switch from '../../cmp/ui/button/switch';
import InputNum from '../../cmp/ui/input';

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
