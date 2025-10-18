import { useEffect, useState } from 'react';
import { getInventoryConfig, upsertInventoryConfig } from '../api/inventory';
import { listEvents } from '../api/events';

export default function InventoryConfig(){
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cfg, setCfg] = useState({ holdTimeoutSec: 300, allowOverbook: false });

  useEffect(() => { listEvents(0, 50).then(setEvents) }, []);

  useEffect(() => {
    if (selected) getInventoryConfig(selected).then(d => setCfg(d));
  }, [selected]);

  async function onSave(){
    await upsertInventoryConfig(selected, {
      holdTimeoutSec: Number(cfg.holdTimeoutSec),
      allowOverbook: !!cfg.allowOverbook
    });
    alert('Saved');
  }

  return (
    <div>
      <h3>Inventory Config</h3>

      <div className="row g-2 mb-3">
        <div className="col-4">
          <select className="form-select"
            value={selected || ''} onChange={e=>setSelected(Number(e.target.value))}>
            <option value='' disabled>Chọn sự kiện</option>
            {events?.content?.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {selected && (
          <>
            <div className="col-3">
              <label className="form-label">Hold timeout (sec)</label>
              <input className="form-control" type="number"
                     value={cfg.holdTimeoutSec}
                     onChange={e=>setCfg(c=>({...c, holdTimeoutSec:e.target.value}))}/>
            </div>
            <div className="col-3 d-flex align-items-end">
              <div className="form-check">
                <input className="form-check-input" type="checkbox"
                  checked={cfg.allowOverbook}
                  onChange={e=>setCfg(c=>({...c, allowOverbook:e.target.checked}))}/>
                <label className="form-check-label">Allow overbook</label>
              </div>
            </div>
            <div className="col-auto d-flex align-items-end">
              <button className="btn btn-primary" onClick={onSave}>Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
