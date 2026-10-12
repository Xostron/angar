import useInputStore from '@src/entities/store/input';
import DescContainer from './desc_container';
import SignalContainer from './signal_container';
import IncidentItem from '@src/entities/incident_item';
import style from './style.module.css';
import { useParams } from 'react-router-dom';

const SignalPage = () => {
  const { buildingId } = useParams();
  const signal = useInputStore((s) => s?.alarm?.signal?.[buildingId]);

  return (
    <main className={style.container}>
      <SignalContainer stl={{ width: '1176px', height: '882px' }}>
        {!!signal?.length &&
          signal.map((el) => <IncidentItem key={el.uid} data={el} />)}
      </SignalContainer>
      <DescContainer stl={{ width: '750px' }}></DescContainer>
    </main>
  );
};

export default SignalPage;
