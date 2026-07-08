import React, { useState, useRef, useEffect } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

interface Props {
  value: string;
  onChange: (v: string) => void;
  max?: string;
  min?: string;
  placeholder: string;
}

const DatePicker: React.FC<Props> = ({ value, onChange, max, min, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ y: number; m: number }>(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setView({ y: d.getFullYear(), m: d.getMonth() });
    }
  }, [value]);

  const today = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const toISO = (d: number) =>
    `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isDisabled = (d: number) => {
    const iso = toISO(d);
    return (!!min && iso < min) || (!!max && iso > max);
  };
  const prevMonth = () => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const nextMonth = () => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });

  const display = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          border: `1.5px solid ${value ? '#4CAF82' : open ? '#4CAF82' : '#E8E8F0'}`,
          borderRadius: 10, padding: '7px 10px',
          background: value ? '#F6FFF9' : '#FAFAFA',
          cursor: 'pointer', minWidth: 148,
          transition: 'border 0.2s, background 0.2s',
          fontFamily: 'Poppins', fontSize: 12,
          color: value ? '#333' : '#B5B7C0', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 13 }}>&#128197;</span>
        <span style={{ flex: 1 }}>{display || placeholder}</span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); }} style={{ fontSize: 14, color: '#ACACAC', lineHeight: 1, marginLeft: 2 }}>&times;</span>
          : <span style={{ fontSize: 10, color: '#ACACAC' }}>&#9662;</span>
        }
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 999,
          background: '#fff', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.13)', padding: '14px 14px 10px',
          width: 240, fontFamily: 'Poppins',
        }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9197B3', padding: '0 4px', lineHeight: 1 }}>&#8249;</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{MONTHS[view.m]} {view.y}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9197B3', padding: '0 4px', lineHeight: 1 }}>&#8250;</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#B5B7C0', padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = toISO(d);
              const selected = iso === value;
              const disabled = isDisabled(d);
              const isToday = iso === today;
              return (
                <div
                  key={i}
                  onClick={() => { if (!disabled) { onChange(iso); setOpen(false); } }}
                  style={{
                    textAlign: 'center', fontSize: 12, padding: '5px 0', borderRadius: 7,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: selected ? '#4CAF82' : 'transparent',
                    color: selected ? '#fff' : disabled ? '#D0D0D0' : isToday ? '#4CAF82' : '#333',
                    fontWeight: selected || isToday ? 600 : 400,
                    border: isToday && !selected ? '1.5px solid #C3EDD5' : '1.5px solid transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!disabled && !selected) (e.currentTarget as HTMLDivElement).style.background = '#F0FFF6'; }}
                  onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div style={{ marginTop: 10, borderTop: '1px solid #F0F0F0', paddingTop: 8, textAlign: 'center' }}>
            <button
              onClick={() => { onChange(today); setOpen(false); }}
              style={{ fontSize: 11, fontWeight: 500, color: '#4CAF82', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins' }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
