import { Children, useRef, useState, useEffect } from 'react';
import './style.css';
const dictSize = {
  bcard: { width: 372.75, height: 388 },
  scard_normal: { width: 377.67, height: 376.5 },
  scard_combi: { width: 377, height: 346 },
  // В складе холодильник не отображаются камеры, добавлено для совместимости
  scard_cold: { width: 377.67, height: 376.5 },
};
const GAP = 12;

const ScrollGrid = ({ children, size = 'bcard' }) => {
  const trackRef = useRef(null);
  const [cols, setCols] = useState(1);
  const [page, setPage] = useState(0);
  const items = Children.toArray(children);
  const perPage = cols * 2;
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentItems = items.slice(page * perPage, (page + 1) * perPage);

  const CARD_WIDTH = dictSize?.[size]?.width;
  const CARD_HEIGHT = dictSize?.[size]?.height;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      setCols(Math.max(1, Math.floor((w + GAP) / (CARD_WIDTH + GAP))));
    };

    measure();
    setPage(0);

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    setPage(0);
  }, [items.length]);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  return (
    <div className="scroll-grid">
      <div className="scroll-grid__track" ref={trackRef}>
        {/* TODO */}
        <div
          className="scroll-grid__grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CARD_WIDTH}px)`,
            gridTemplateRows: `repeat(2, ${CARD_HEIGHT}px)`,
          }}
        >
          {currentItems}
        </div>
      </div>
      <div className="scroll-grid__nav">
        <span className="scroll-grid__page">
          Страница {page + 1} из {totalPages}
        </span>
        <div className="scroll-grid__buttons">
          <button
            className="scroll-grid__btn"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            &lt; Назад
          </button>
          <button
            className="scroll-grid__btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Далее &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScrollGrid;
