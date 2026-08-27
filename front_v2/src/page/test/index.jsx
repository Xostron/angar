import { useState } from 'react';
import Button from '../../cmp/ui/button/btn';
import TogBtn2 from '../../cmp/ui/button/toggle_button2';

function PageTest({}) {
  const [on, setOn] = useState(false);
  const [onn, setOnn] = useState(false);
  return (
    <article style={style}>
      <Button label="Включить" variant="primary" />;
      <Button label="Выключить" variant="secondary" />;
      <Button label="Выключить" disabled={true} />;
      <Button label="Сушка" variant="mode-primary" type="mode" />;
      <Button label="Сушка" variant="mode-secondary" type="mode" />;
      <Button label="Секция" variant="sect-primary" type="sect" />;
      <Button label="Секция" variant="sect-secondary" type="sect" />;
      <TogBtn2
        data={[
          { value: false, label: 'ВЫКЛ' },
          { value: true, label: 'ВКЛ' },
        ]}
        cur={on}
        action={(v) => setOn(v)}
      />
      <TogBtn2
        data={[
          { value: false, label: 'ВЫКЛ' },
          { value: true, label: 'ВКЛ' },
        ]}
        cur={on}
        action={(v) => setOn(v)}
        disabled={true}
      />
      <TogBtn2
        data={[
          { value: false, label: 'ВЫКЛ' },
          { value: true, label: 'ВКЛ' },
          { value: null, label: 'РУЧ' },
        ]}
        cur={onn}
        action={(v) => setOnn(v)}
        variant={3}
      />
      <TogBtn2
        data={[
          { value: false, label: 'ВЫКЛ' },
          { value: true, label: 'ВКЛ' },
          { value: null, label: 'РУЧ' },
        ]}
        cur={onn}
        action={(v) => setOnn(v)}
        disabled={true}
        variant={3}
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
