// src/pages/Reports.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ticketService from '../services/ticket.service';
import deviceService from '../services/device.service';
import { fetchIncidents } from '../api/incidents';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'incidents' | 'tickets' | 'devices';

export default function Reports() {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isOperator } = useAuth();
  const { t } = useLanguage();
  const [reportType, setReportType] = useState<ReportType>('tickets');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!user || !isOperator) {
      navigate('/login');
      return;
    }

    // Establecer fechas por defecto (último mes)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, [user, isOperator, navigate]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona un rango de fechas válido');
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');

      let data: any[] = [];

      switch (reportType) {
        case 'incidents': {
          const incidents = await fetchIncidents({ status: 'active', limit: 1000 });
          data = incidents
            .filter(inc => {
              const pubDate = new Date(inc.pub_time);
              return pubDate >= start && pubDate <= end;
            })
            .map(inc => ({
              [t('field.id')]: inc.id,
              [t('field.uuid')]: inc.uuid,
              [t('field.type')]: t(`ticket.type.${inc.type}`) || inc.type,
              [t('field.category')]: inc.category || t('field.na'),
              [t('field.city')]: inc.city || t('field.na'),
              [t('field.street')]: inc.street || t('field.na'),
              [t('field.latitude')]: inc.lat,
              [t('field.longitude')]: inc.lon,
              [t('field.priority')]: inc.priority || t('field.na'),
              [t('field.reliability')]: inc.reliability || t('field.na'),
              [t('field.datetime')]: new Date(inc.pub_time).toLocaleString('es-PE'),
            }));
          break;
        }

        case 'tickets': {
          const tickets = await ticketService.getAllTickets();
          data = tickets
            .filter(ticket => {
              const createdDate = new Date(ticket.createdAt);
              return createdDate >= start && createdDate <= end;
            })
            .map(ticket => {
              const created = new Date(ticket.createdAt);
              const updated = new Date(ticket.updatedAt);
              const resolutionTime = ticket.status === 'DONE'
                ? ((updated.getTime() - created.getTime()) / (1000 * 60 * 60)).toFixed(2) 
                : t('field.na');

              return {
                [t('field.id')]: ticket.id,
                [t('field.title')]: ticket.title,
                [t('field.description')]: ticket.description || t('field.na'),
                [t('field.status')]: t(`ticket.status.${ticket.status}`) || ticket.status,
                [t('field.priority')]: ticket.priority || t('field.na'),
                [t('field.source')]: t(`ticket.source.${ticket.source}`) || ticket.source,
                [t('field.incidentType')]: ticket.incidentType || t('field.na'),
                [t('field.createdBy')]: typeof ticket.createdBy === 'object' 
                  ? (ticket.createdBy?.username || ticket.createdBy?.fullName || t('field.na'))
                  : t('field.na'),
                [t('field.assignedTo')]: typeof ticket.assignedTo === 'object'
                  ? (ticket.assignedTo?.username || ticket.assignedTo?.fullName || t('field.na'))
                  : t('field.unassigned'),
                [t('field.createdAt')]: created.toLocaleString('es-PE'),
                [t('field.updatedAt')]: updated.toLocaleString('es-PE'),
                [t('field.resolutionTime')]: resolutionTime,
              };
            });
          break;
        }

        case 'devices': {
          const devices = await deviceService.getAllDevices();
          data = devices.map(device => ({
            [t('field.id')]: device.id,
            [t('field.type')]: t(`device.type.${device.type}`) || device.type,
            [t('field.brand')]: device.brand,
            [t('field.status')]: t(`device.status.${device.status}`) || device.status,
            [t('field.installYear')]: device.installationYear,
            [t('field.manufactureYear')]: device.manufacturingYear,
            [t('field.ipAddress')]: device.ipAddress,
            [t('field.username')]: device.username,
            [t('field.latitude')]: device.latitude,
            [t('field.longitude')]: device.longitude,
            [t('field.createdAt')]: new Date(device.createdAt).toLocaleString('es-PE'),
            [t('field.updatedAt')]: new Date(device.updatedAt).toLocaleString('es-PE'),
          }));
          break;
        }
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, getReportTitle());

    const fileName = `${getReportTitle()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    if (reportData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Title
    doc.setFontSize(16);
    doc.text(getReportTitle(), 14, 15);
    
    // Date range
    doc.setFontSize(10);
    doc.text(`Período: ${startDate} al ${endDate}`, 14, 22);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 27);

    // Table
    const headers = Object.keys(reportData[0]);
    const rows = reportData.map(row => headers.map(header => row[header]));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 32,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 86, 179] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    const fileName = `${getReportTitle()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'incidents': return t('reports.incidents');
      case 'tickets': return t('reports.tickets');
      case 'devices': return t('reports.devices');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white border-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', boxSizing: 'border-box', height: '60px', flexShrink: 0 }}>
        {/* Logo y Menú de Sistema a la izquierda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0056b3', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-map-marker-alt" style={{ fontSize: '24px' }}></i>
            ALERTAS VIALES
          </div>

          {/* Menú de Sistema */}
          <nav className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '14px' }}
              onClick={() => navigate('/map')}
            >
              <i className="fas fa-map me-2"></i>
              {t('nav.map')}
            </button>
            <button 
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: '14px' }}
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-chart-line me-2"></i>
              {t('nav.dashboard')}
            </button>
            {isOperator && (
              <>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: '14px' }}
                  onClick={() => navigate('/tickets')}
                >
                  <i className="fas fa-ticket-alt me-2"></i>
                  {t('nav.tickets')}
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '14px' }}
                >
                  <i className="fas fa-file-alt me-2"></i>
                  {t('nav.reports')}
                </button>
              </>
            )}
            {isAdmin && (
              <button 
                className="btn btn-sm btn-outline-primary"
                style={{ fontSize: '14px' }}
                onClick={() => navigate('/admin')}
              >
                <i className="fas fa-cog me-2"></i>
                {t('nav.admin')}
              </button>
            )}
          </nav>
        </div>

        {/* Usuario a la derecha */}
        <div className="d-flex gap-3 align-items-center" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-light p-2 d-flex align-items-center gap-2"
              style={{ fontSize: '14px' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0056b3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-user" style={{ color: 'white', fontSize: '16px' }}></i>
              </div>
              <span>{user?.name || user?.username || 'Usuario'}</span>
            </button>

            {/* Dropdown de Usuario */}
            {showUserMenu && (
              <div className="bg-white border rounded" style={{ position: 'absolute', top: '100%', right: '0', width: '200px', zIndex: 3001, marginTop: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-user me-2"></i>Mi Perfil
                </a>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-cog me-2"></i>Configuración
                </a>
                <a href="#" className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" style={{ fontSize: '14px' }}>
                  <i className="fas fa-lock me-2"></i>Cambiar Contraseña
                </a>
                {isAdmin && (
                  <a 
                    href="#" 
                    className="d-block p-3 text-decoration-none text-dark border-bottom hover-light" 
                    style={{ fontSize: '14px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/admin');
                    }}
                  >
                    <i className="fas fa-tools me-2"></i>Panel Admin
                  </a>
                )}
                <a 
                  href="#" 
                  className="d-block p-3 text-decoration-none text-dark hover-light" 
                  style={{ fontSize: '14px', color: '#dc3545' }}
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>{t('nav.logout')}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div className="row">
          <div className="col-md-3">
            {/* Filters Panel */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white">
                <h6 className="mb-0">
                  <i className="fas fa-filter me-2"></i>
                  {t('reports.filters')}
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">{t('reports.reportType')}</label>
                  <select 
                    className="form-select form-select-sm"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                  >
                    <option value="tickets">{t('reports.tickets')}</option>
                    <option value="incidents">{t('reports.incidents')}</option>
                    <option value="devices">{t('reports.devices')}</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">{t('reports.startDate')}</label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t('reports.endDate')}</label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <button 
                  className="btn btn-primary w-100"
                  onClick={generateReport}
                  disabled={loading || !startDate || !endDate}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {t('reports.generating')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-2"></i>
                      {t('reports.generate')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export Panel */}
            {reportData.length > 0 && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h6 className="mb-0">
                    <i className="fas fa-download me-2"></i>
                    {t('reports.export')}
                  </h6>
                </div>
                <div className="card-body">
                  <button 
                    className="btn btn-success w-100 mb-2"
                    onClick={exportToExcel}
                  >
                    <i className="fas fa-file-excel me-2"></i>
                    {t('reports.exportExcel')}
                  </button>
                  <button 
                    className="btn btn-danger w-100"
                    onClick={exportToPDF}
                  >
                    <i className="fas fa-file-pdf me-2"></i>
                    {t('reports.exportPDF')}
                  </button>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      {reportData.length} {reportData.length !== 1 ? t('reports.records') : t('reports.record')}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-9">
            {/* Results Panel */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{getReportTitle()}</h6>
                {reportData.length > 0 && (
                  <span className="badge bg-primary">{reportData.length} registros</span>
                )}
              </div>
              <div className="card-body">
                {reportData.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-chart-bar" style={{ fontSize: '48px', color: '#dee2e6' }}></i>
                    <p className="text-muted mt-3">
                      {t('reports.selectFilters')}
                    </p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          {Object.keys(reportData[0]).map(header => (
                            <th key={header} style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((value: any, cellIdx) => (
                              <td key={cellIdx} style={{ fontSize: '12px' }}>
                                {value !== null && value !== undefined ? String(value) : 'N/A'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Report Descriptions */}
            <div className="row mt-3 g-3">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-2">
                      <i className="fas fa-ticket-alt me-2 text-primary"></i>
                      {t('reports.tickets')}
                    </h6>
                    <small className="text-muted">
                      {t('reports.ticketsDesc')}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-2">
                      <i className="fas fa-exclamation-circle me-2 text-danger"></i>
                      {t('reports.incidents')}
                    </h6>
                    <small className="text-muted">
                      {t('reports.incidentsDesc')}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="mb-2">
                      <i className="fas fa-hdd me-2 text-info"></i>
                      {t('reports.devices')}
                    </h6>
                    <small className="text-muted">
                      {t('reports.devicesDesc')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
