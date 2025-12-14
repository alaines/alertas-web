// src/pages/Devices.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import deviceService from '../services/device.service';
import type { Device, CreateDeviceDto, UpdateDeviceDto, DeviceType, DeviceStatus } from '../types/device.types';

const LIMA_CENTER: [number, number] = [-12.0464, -77.0428];

// Iconos para diferentes tipos de dispositivos
function getDeviceIcon(type: DeviceType, status: DeviceStatus) {
  const colors = {
    ACTIVE: '#28a745',
    INACTIVE: '#dc3545',
    MAINTENANCE: '#ffc107'
  };
  
  const icons = {
    CAMERA: 'fa-video',
    TRAFFIC_LIGHT: 'fa-traffic-light',
    SENSOR: 'fa-microchip',
    COUNTING_CAMERA: 'fa-camera'
  };

  const html = `
    <div style="
      background-color: ${colors[status]};
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <i class="fas ${icons[type]}" style="color: white; font-size: 16px;"></i>
    </div>
  `;

  return L.divIcon({
    html: html,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'device-icon'
  });
}

// Componente para manejar clics en el mapa
function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const deviceTypes = [
    { value: 'CAMERA', label: 'Cámara' },
    { value: 'TRAFFIC_LIGHT', label: 'Semáforo' },
    { value: 'SENSOR', label: 'Sensor' },
    { value: 'COUNTING_CAMERA', label: 'Cámara de Conteo' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Activo', color: 'success' },
    { value: 'INACTIVE', label: 'Inactivo', color: 'danger' },
    { value: 'MAINTENANCE', label: 'Mantenimiento', color: 'warning' }
  ];

  const [formData, setFormData] = useState<CreateDeviceDto>({
    type: 'CAMERA',
    brand: '',
    installationYear: new Date().getFullYear(),
    manufacturingYear: new Date().getFullYear(),
    latitude: LIMA_CENTER[0],
    longitude: LIMA_CENTER[1],
    ipAddress: '',
    username: '',
    password: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deviceService.getAllDevices();
      setDevices(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        type: device.type,
        brand: device.brand,
        installationYear: device.installationYear,
        manufacturingYear: device.manufacturingYear,
        latitude: device.latitude,
        longitude: device.longitude,
        ipAddress: device.ipAddress,
        username: device.username,
        password: device.password,
        status: device.status
      });
    } else {
      setEditingDevice(null);
      setFormData({
        type: 'CAMERA',
        brand: '',
        installationYear: new Date().getFullYear(),
        manufacturingYear: new Date().getFullYear(),
        latitude: LIMA_CENTER[0],
        longitude: LIMA_CENTER[1],
        ipAddress: '',
        username: '',
        password: '',
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
    setShowMap(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDevice(null);
    setShowMap(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.brand || !formData.ipAddress || !formData.username || !formData.password) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      if (editingDevice) {
        await deviceService.updateDevice(editingDevice.id, formData as UpdateDeviceDto);
      } else {
        await deviceService.createDevice(formData);
      }
      
      handleCloseModal();
      loadDevices();
    } catch (err: any) {
      alert(`Error al ${editingDevice ? 'actualizar' : 'crear'} el dispositivo: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este dispositivo?')) return;

    try {
      await deviceService.deleteDevice(id);
      loadDevices();
    } catch (err: any) {
      alert(`Error al eliminar el dispositivo: ${err.message}`);
    }
  };

  const handleChangeStatus = async (id: number, status: DeviceStatus) => {
    try {
      await deviceService.changeStatus(id, status);
      loadDevices();
    } catch (err: any) {
      alert(`Error al cambiar el estado: ${err.message}`);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6))
    });
  };

  const getTypeLabel = (type: DeviceType) => {
    return deviceTypes.find(t => t.value === type)?.label || type;
  };

  const getStatusColor = (status: DeviceStatus) => {
    return statusOptions.find(s => s.value === status)?.color || 'secondary';
  };

  const getStatusLabel = (status: DeviceStatus) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-hdd me-2"></i>
          Gestión de Periféricos
        </h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-2"></i>
          Nuevo Periférico
        </button>
      </div>

      {/* Lista de Dispositivos */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="fas fa-hdd fa-3x mb-3"></i>
              <p>No hay periféricos registrados</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Marca</th>
                    <th>Año Inst.</th>
                    <th>Año Fab.</th>
                    <th>Ubicación</th>
                    <th>IP</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device.id}>
                      <td>#{device.id}</td>
                      <td>
                        <i className={`fas ${
                          device.type === 'CAMERA' ? 'fa-video' :
                          device.type === 'TRAFFIC_LIGHT' ? 'fa-traffic-light' :
                          device.type === 'SENSOR' ? 'fa-microchip' :
                          'fa-camera'
                        } me-2`}></i>
                        {getTypeLabel(device.type)}
                      </td>
                      <td>{device.brand}</td>
                      <td>{device.installationYear}</td>
                      <td>{device.manufacturingYear}</td>
                      <td className="small">
                        {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                      </td>
                      <td className="small">{device.ipAddress}</td>
                      <td>
                        <div className="dropdown">
                          <button
                            className={`btn btn-sm btn-${getStatusColor(device.status)} dropdown-toggle`}
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {getStatusLabel(device.status)}
                          </button>
                          <ul className="dropdown-menu">
                            {statusOptions.map(status => (
                              <li key={status.value}>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleChangeStatus(device.id, status.value as DeviceStatus);
                                  }}
                                >
                                  {status.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleOpenModal(device)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(device.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-hdd me-2"></i>
                  {editingDevice ? 'Editar Periférico' : 'Nuevo Periférico'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* Columna Izquierda - Formulario */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tipo *</label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as DeviceType })}
                          required
                        >
                          {deviceTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Marca *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Año de Instalación *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={formData.installationYear}
                              onChange={(e) => setFormData({ ...formData, installationYear: parseInt(e.target.value) })}
                              min="1900"
                              max={new Date().getFullYear() + 1}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Año de Fabricación *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={formData.manufacturingYear}
                              onChange={(e) => setFormData({ ...formData, manufacturingYear: parseInt(e.target.value) })}
                              min="1900"
                              max={new Date().getFullYear() + 1}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Dirección IP *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.ipAddress}
                          onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                          placeholder="192.168.1.100"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Usuario *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Contraseña *</label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as DeviceStatus })}
                        >
                          {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Columna Derecha - Mapa */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ubicación Geográfica</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary ms-2"
                          onClick={() => setShowMap(!showMap)}
                        >
                          <i className={`fas fa-${showMap ? 'eye-slash' : 'map-marked-alt'} me-1`}></i>
                          {showMap ? 'Ocultar' : 'Mostrar'} Mapa
                        </button>
                      </div>

                      {showMap && (
                        <div className="mb-3" style={{ height: '400px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                          <MapContainer
                            center={[formData.latitude, formData.longitude]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              attribution="&copy; OpenStreetMap contributors"
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationPicker onLocationSelect={handleLocationSelect} />
                            <Marker
                              position={[formData.latitude, formData.longitude]}
                              icon={getDeviceIcon(formData.type, formData.status || 'ACTIVE')}
                            />
                          </MapContainer>
                        </div>
                      )}

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Latitud *</label>
                            <input
                              type="number"
                              step="0.000001"
                              className="form-control"
                              value={formData.latitude}
                              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Longitud *</label>
                            <input
                              type="number"
                              step="0.000001"
                              className="form-control"
                              value={formData.longitude}
                              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        <small>Haz clic en el mapa para seleccionar la ubicación del periférico. Los campos de latitud y longitud se actualizarán automáticamente.</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {editingDevice ? 'Actualizar' : 'Crear'} Periférico
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
