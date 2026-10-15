import { Children, useRef, useState, useEffect } from 'react';
import style from './style.module.css';
import PageButton from '@src/shared/ui/button/paging_btn';

const dictSize = {
  signal: {
    height: 72,
    gap: 12,
  },
};

const SignalContainer = ({ children, stl }) => {
  const height = stl.height;
  //   Текущая страница
  const [page, setPage] = useState(0);
  //   Все элементы
  const items = Children.toArray(children);
  //   Кол-во элементов на странице
  const perPage = 9;
  //   Кол-во страниц
  const totalPage = Math.max(1, Math.ceil(items.length / perPage));
  //   Элементы на текущей странице
  const currentItems = items.slice(page * perPage, (page + 1) * perPage);
  return (
    <section className={style.container} style={stl}>
      <div className={style.children}>{currentItems}</div>

      <div className={style.paging}>
        <span>
          Страница {page + 1} из {totalPage}
        </span>
        <div className={style.buttons}>
          <PageButton
            label="Назад"
            variant="back"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          />
          <PageButton
            label="Далее"
            variant="next"
            disabled={page >= totalPage - 1}
            onClick={() => setPage((p) => p + 1)}
          />
        </div>
      </div>
    </section>
  );
};

export default SignalContainer;
