import { Link } from 'react-router-dom';
import style from './style.module.css';

function Scard({ data }) {
  return (
    <Link className={style.container} to={`/section/${data.idS}`}>
      {/*  */}
    </Link>
  );
}

export default Scard;
