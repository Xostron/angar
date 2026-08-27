import { Children, useRef, useState, useEffect } from 'react';
import './style.css';

const CARD_WIDTH = 371;
const GAP = 12;

const ScrollGrid = ({ children }) => {
  const trackRef = useRef(null);
  const [cols, setCols] = useState(1);
  const [page, setPage] = useState(0);
  const items = Children.toArray(children);
  const perPage = cols * 2;
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentItems = items.slice(page * perPage, (page + 1) * perPage);

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
        <div
          className="scroll-grid__grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CARD_WIDTH}px)`,
            gridTemplateRows: `repeat(2, 1fr)`,
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
