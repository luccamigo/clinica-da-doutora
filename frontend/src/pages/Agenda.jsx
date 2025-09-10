import React, { useEffect, useMemo, useState } from 'react';
import styles from './Agenda.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConsultasPorDia } from '../features/consultas/consultasSlice';
import NewConsultaModal from '../components/NewConsultaModal';
import ConsultaDetailsModal from '../components/ConsultaDetailsModal';

const slotsBetween = (start = '07:00', end = '19:00', stepMin = 30) => {
  const toMin = (t) => { const [h,m] = t.split(':').map(n=>parseInt(n,10)); return h*60+(m||0); };
  const toStr = (min) => `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
  const res = [];
  for (let t = toMin(start); t <= toMin(end); t += stepMin) res.push(toStr(t));
  return res;
};

const fmtTitle = (iso) => {
  try {
    const d = new Date(iso+'T00:00:00');
    const fmt = d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
    return fmt.charAt(0).toUpperCase()+fmt.slice(1);
  } catch { return iso; }
};

export default function AgendaPage() {
  const dispatch = useDispatch();
  const { byDay, byId } = useSelector((s) => s.consultas);
  const [dia, setDia] = useState(() => new Date().toISOString().slice(0,10));
  const [createOpen, setCreateOpen] = useState(false);
  const [createHora, setCreateHora] = useState('');
  const [detailsId, setDetailsId] = useState(null);

  useEffect(() => { dispatch(fetchConsultasPorDia(dia)); }, [dia, dispatch]);

  const slots = useMemo(() => slotsBetween('07:00', '19:00', 30), []);
  const ids = byDay[dia] || [];
  const porHora = useMemo(() => {
    const map = {};
    for (const id of ids) {
      const c = byId[id];
      if (!c) continue;
      const h = (c.hora || '').slice(0,5);
      if (!map[h]) map[h] = [];
      map[h].push(c);
    }
    return map;
  }, [ids, byId]);

  const go = (days) => {
    const d = new Date(dia+'T00:00:00');
    d.setDate(d.getDate()+days);
    setDia(d.toISOString().slice(0,10));
  };

  // Current time indicator (only if viewing today)
  const nowIndicator = () => {
    const todayIso = new Date().toISOString().slice(0,10);
    if (todayIso !== dia) return null;
    const now = new Date();
    const minutes = now.getHours()*60 + now.getMinutes();
    const start = 7*60, end = 19*60; // 07:00–19:00
    if (minutes < start || minutes > end) return null;
    const pct = (minutes - start) / (end - start);
    const containerH = (end - start) / 30 * 36; // 36px per 30min (2.25rem) matches CSS
    const top = Math.round(pct * containerH);
    return (<div className={styles.nowLine} style={{ top }} />);
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.nav}>
          <button className={`btn btn-outline-secondary btn-sm`} onClick={()=>go(-1)} aria-label="Dia anterior">‹</button>
          <button className={`btn btn-outline-secondary btn-sm`} onClick={()=>go(1)} aria-label="Próximo dia">›</button>
          <button className={`btn btn-light btn-sm`} onClick={()=>setDia(new Date().toISOString().slice(0,10))}>Hoje</button>
        </div>
        <h1 className={styles.title}>{fmtTitle(dia)}</h1>
        <div className="d-flex align-items-center gap-3">
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: 'auto' }}
            value={dia}
            onChange={(e)=>setDia(e.target.value)}
          />
          <button className="btn btn-primary" onClick={()=>{ setCreateHora(''); setCreateOpen(true); }}>+ Nova Consulta</button>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.hours}>
          {slots.map((h,i)=> (
            <div key={h} className={styles.tcell}>
              {h.endsWith(':00') ? <div className={styles.hlabel}>{h}</div> : null}
            </div>
          ))}
        </div>
        <div className={styles.grid}>
          {nowIndicator()}
          {slots.map((h)=> (
            <div key={h} className={styles.tcell}>
              <div className={styles.slot} onClick={()=>{ setCreateHora(h); setCreateOpen(true); }}>
                <div className={styles.events}>
                  {(porHora[h] || []).map((c) => (
                    <div key={c.id} className={styles.event} onClick={(e)=>{ e.stopPropagation(); setDetailsId(c.id); }}>
                      <div className={styles.eventTitle}>{c.descricao}</div>
                      <div className={styles.eventMeta}>{h} · CPF {c.cpfPaciente || c.cpf_paciente}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewConsultaModal open={createOpen} defaultDia={dia} defaultHora={createHora} onClose={(changed)=>{ setCreateOpen(false); if (changed) dispatch(fetchConsultasPorDia(dia)); }} />
      <ConsultaDetailsModal open={!!detailsId} id={detailsId} onClose={(changed)=>{ setDetailsId(null); if (changed) dispatch(fetchConsultasPorDia(dia)); }} />
    </div>
  );
}
