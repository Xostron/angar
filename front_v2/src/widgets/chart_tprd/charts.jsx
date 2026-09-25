import { useState, useEffect, useMemo } from 'react';
import Echart from '@src/shared/ui/echart/echart';
import style from './style.module.css';
import useInputStore from '@src/entities/store/input';
import { useParams } from 'react-router-dom';

const STATE_LABELS = ['Выкл', 'Норма', 'Авария'];

// Гистограмма темп. продукта в секции
export default function ChartTprd({}) {
  const { buildingId: idB, sectionId: idS } = useParams();
  const [loading, setLoading] = useState(false);
  // Датчики температуры для отображения
  const tprds = useInputStore(
    (s) => s?.input?.innerSec?.[idB]?.[idS]?.tprdChart,
  );
  // Анализ датчиков темп: мин, макс, задание
  const tprd = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]?.tprd);

  //   Ожидание данных
  useEffect(() => {
    if (!tprds?.length) return setLoading(true);
    setLoading(false);
  }, [tprds]);

  // Расчет конфига для графика
  const option = useMemo(
    () => fnOption(tprd, tprds),
    [tprds?.[0]?._id, tprd?.min, tprd?.max, tprd?.target],
  );

  return (
    <div className={style.container}>
      {option && (
        <Echart
          option={option}
          loading={loading}
          style={{ width: '100%', height: '259px' }}
        />
      )}
    </div>
  );

  //   Конфиг для отрисовки графика
  function fnOption(tprd, tprds) {
    if (!tprds || tprds?.length === 0) return;

    // Трансформируем массив объектов из стора в отдельные массивы для каждого датчика
    const series = tprds.reduce(
      (acc, el, i) => {
        acc[0].data.push(el.value);
        return acc;
      },

      [
        {
          type: 'bar',
          itemStyle: {
            color: (params) => {
              const idx = params.dataIndex;
              switch (tprds?.[idx]?.state) {
                case 'on':
                  return '#65A7EE';
                case 'off':
                  return '#7b8a9d';
                case 'alarm':
                  return '#E83757';
                default:
                  return '#65A7EE';
              }
            },
          },
          silent: true, // отключение hover
          data: [],
          label: {
            show: true,
            position: 'insideTop', // Отображать текст ВНУТРИ столбца
            formatter: '{c} °', // {c} автоматически подставит число из data (21)
            color: '#fff', // Белый цвет текста, чтобы его было хорошо видно на синем фоне
            fontSize: 20, // Размер шрифта
            fontWeight: 'bold', // Жирный текст
          },
          // ГОРИЗОНТАЛЬНЫЕ ЛИНИИ МИН И МАКС
          markLine: {
            symbol: ['none', 'none'], // Убираем стрелочки на концах линий
            silent: true, // График не будет "дёргаться" при наведении мыши на линии
            data: [
              {
                yAxis: tprd.max,
                name: 'Макс',
                lineStyle: {
                  color: '#E83757', // Красный цвет
                  type: 'dashed', // Пунктирная линия ('solid', 'dashed', 'dotted')
                  width: 2, // Толщина в пикселях
                },
                label: { show: false },
              },
              {
                yAxis: tprd.min,
                name: 'Мин',
                lineStyle: {
                  color: '#65A7EE', // Синий/голубой цвет
                  type: 'dashed',
                  width: 2,
                },
                label: { show: false },
              },
              {
                yAxis: tprd.target, // Значение для задания
                lineStyle: {
                  color: '#65A7EE', // Синий/голубой цвет
                  type: 'solid',
                  width: 2,
                },
                label: { show: false },
              },
            ],
          },
        },
      ],
    );

    const opt = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        valueFormatter: (value) => `${value} °C`,
      },
      legend: { show: false },
      grid: {
        top: '46px', // Отступ сверху (чтобы поместилось имя оси Y "°C")
        bottom: '12px', // Минимальный отступ снизу
        left: '12px', // Отступ слева
        right: '12px', // Отступ справа
        containLabel: true, // ВАЖНО: ECharts сам посчитает размеры осей внутри этих 500px
      },
      xAxis: {
        type: 'category',
        data: ['t1', 't2'],
        axisLabel: {
          show: true, // ОБЯЗАТЕЛЬНО включаем показ меток
          color: '#7B8A9D',
          fontSize: 20,
          fontWeight: 'normal',
        },
        axisTick: { show: true }, // Показываем засечки возле имен
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} °' },
      },
      series,
    };

    return opt;
  }
}
