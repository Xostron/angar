import { useState } from 'react';
import Button from '../../cmp/ui/button/btn';
import Toggle2 from '../../cmp/ui/button/toggle_button_2';
import Toggle3 from '../../cmp/ui/button/toggle_button_3';
import Switch from '../../cmp/ui/button/switch';

function PageTest({}) {
  // Toggle2
  const [on, setOn] = useState(false);
  //  Toggle3
  const [onn, setOnn] = useState(false);
  return (
    <article style={style}>
      <Button label="Включить" variant="usual" active={true} disabled={false} />
      <Button
        label="Выключить"
        variant="usual"
        active={false}
        disabled={false}
      />
      <Button label="Включить" variant="usual" active={true} disabled={true} />
      <Button
        label="Выключить"
        variant="usual"
        active={false}
        disabled={true}
      />
      {/*  */}
      <Button label="Сушка" variant="automode" active={true} disabled={false} />
      <Button
        label="Сушка"
        variant="automode"
        active={false}
        disabled={false}
      />
      ;{/*  */}
      <Button label="Секция" variant="sect" active={true} disabled={false} />;
      <Button label="Секция" variant="sect" active={false} disabled={false} />;
      <Button label="Секция" variant="sect" active={true} disabled={true} />;
      <Button label="Секция" variant="sect" active={false} disabled={true} />;
      {/* <Button label="Секция" variant="sect-primary" type="sect" />; */}
      {/* <Button label="Секция" variant="sect-secondary" type="sect" />; */}
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
  );
}

export default PageTest;

const style = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '16px',
};
