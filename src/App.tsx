// src/App.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Icon } from 'leaflet';
import L from 'leaflet';
import { fetchIncidents } from './api/incidents';
import type { Incident } from './api/incidents';

// Centro de Lima aproximado
const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

// Fix para iconos de Leaflet (porque por defecto en bundlers no se ven)
const defaultIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) as Icon;

function formatCategory(cat: string | null): string {
  if (!cat) return 'sin categoría';
  return cat;
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidents({ status: 'active', limit: 200 });
      setIncidents(data);
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(`Error al cargar incidentes: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Panel lateral */}
      <aside style={{ width: '340px', borderRight: '1px solid #ddd', padding: '12px', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Alertas viales</h2>
        <small style={{ color: '#666', marginBottom: '12px' }}>Fuente: Waze (vía alertas-api)</small>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button onClick={load} disabled={loading} style={{ padding: '6px 12px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
          <span style={{ fontSize: '12px', alignSelf: 'center' }}>
            Activos: {incidents.length}
          </span>
        </div>

        {error && (
          <div style={{ color: 'white', background: '#dc3545', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>
          <strong>Legendita mental v0:</strong>
          <br />
          Por ahora todos los marcadores son iguales; después pintamos por tipo/prioridad.
        </div>

        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #eee', paddingTop: '8px' }}>
          {incidents.map((i) => (
            <div key={i.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '6px', fontSize: '12px' }}>
              <strong>{i.type}</strong> ({formatCategory(i.category)})
              <br />
              {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
              <br />
              <span style={{ color: '#777' }}>
                Prioridad: {i.priority ?? '-'} | Confiab.: {i.reliability ?? '-'}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Mapa */}
      <div style={{ flex: 1, height: '100%', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
        <MapContainer
          center={LIMA_CENTER}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {incidents.map((i) => (
            <Marker key={i.id} position={[i.lat, i.lon]} icon={defaultIcon}>
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <strong>{i.type}</strong> ({formatCategory(i.category)})
                  <br />
                  {i.city ?? ''} {i.street ? `- ${i.street}` : ''}
                  <br />
                  Prioridad: {i.priority ?? '-'}
                  <br />
                  Confiabilidad: {i.reliability ?? '-'}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
