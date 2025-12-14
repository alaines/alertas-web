// src/context/LanguageContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Navigation
    'nav.map': 'Mapa',
    'nav.dashboard': 'Dashboard',
    'nav.tickets': 'Tickets',
    'nav.reports': 'Reportes',
    'nav.admin': 'Administración',
    'nav.logout': 'Cerrar Sesión',
    
    // Dashboard
    'dashboard.title': 'DASHBOARD',
    'dashboard.activeIncidents': 'Incidentes Activos',
    'dashboard.openTickets': 'Tickets Abiertos',
    'dashboard.inProgress': 'En Progreso',
    'dashboard.avgTime': 'Tiempo Promedio',
    'dashboard.realTime': 'En tiempo real',
    'dashboard.pending': 'Pendientes de atención',
    'dashboard.beingAttended': 'Siendo atendidos',
    'dashboard.resolution': 'Resolución de tickets',
    'dashboard.ticketStatus': 'Estado de Tickets',
    'dashboard.open': 'Abiertos',
    'dashboard.closed': 'Cerrados',
    'dashboard.incidentsByType': 'Incidentes por Tipo',
    'dashboard.deviceStatus': 'Estado de Dispositivos',
    'dashboard.active': 'Activos',
    'dashboard.maintenance': 'Mantenimiento',
    'dashboard.inactive': 'Inactivos',
    'dashboard.recentActivity': 'Actividad Reciente',
    'dashboard.noActivity': 'No hay actividad reciente',
    'dashboard.today': 'Hoy',
    'dashboard.week': 'Semana',
    'dashboard.month': 'Mes',
    'dashboard.statistics': 'Estadísticas',
    'dashboard.lastWeek': 'Última Semana',
    'dashboard.lastMonth': 'Último Mes',
    
    // Reports
    'reports.title': 'REPORTES',
    'reports.filters': 'Filtros',
    'reports.reportType': 'Tipo de Reporte',
    'reports.startDate': 'Fecha Inicio',
    'reports.endDate': 'Fecha Fin',
    'reports.generate': 'Generar Reporte',
    'reports.generating': 'Generando...',
    'reports.export': 'Exportar',
    'reports.exportExcel': 'Exportar a Excel',
    'reports.exportPDF': 'Exportar a PDF',
    'reports.records': 'registros',
    'reports.record': 'registro',
    'reports.tickets': 'Reporte de Tickets',
    'reports.incidents': 'Reporte de Incidentes',
    'reports.devices': 'Reporte de Dispositivos',
    'reports.ticketsDesc': 'Incluye estado, prioridad, tiempos de resolución, asignaciones y descripción de cada ticket.',
    'reports.incidentsDesc': 'Lista de incidentes por tipo, ubicación, prioridad y confiabilidad en el período seleccionado.',
    'reports.devicesDesc': 'Inventario completo de periféricos con estado operativo, ubicación y datos de instalación.',
    'reports.selectFilters': 'Selecciona los filtros y haz clic en "Generar Reporte" para ver los datos',
    
    // Report Fields
    'field.id': 'ID',
    'field.uuid': 'UUID',
    'field.title': 'Título',
    'field.description': 'Descripción',
    'field.status': 'Estado',
    'field.priority': 'Prioridad',
    'field.source': 'Fuente',
    'field.incidentType': 'Tipo Incidente',
    'field.createdBy': 'Creado por',
    'field.assignedTo': 'Asignado a',
    'field.createdAt': 'Fecha Creación',
    'field.updatedAt': 'Última Actualización',
    'field.resolutionTime': 'Tiempo Resolución (horas)',
    'field.type': 'Tipo',
    'field.category': 'Categoría',
    'field.city': 'Ciudad',
    'field.street': 'Calle',
    'field.latitude': 'Latitud',
    'field.longitude': 'Longitud',
    'field.reliability': 'Confiabilidad',
    'field.datetime': 'Fecha/Hora',
    'field.brand': 'Marca',
    'field.installYear': 'Año Instalación',
    'field.manufactureYear': 'Año Fabricación',
    'field.ipAddress': 'Dirección IP',
    'field.username': 'Usuario',
    'field.na': 'N/A',
    'field.unassigned': 'Sin asignar',
    
    // Ticket Types
    'ticket.type.ACCIDENT': 'Accidente',
    'ticket.type.CONGESTION': 'Congestión',
    'ticket.type.HAZARD': 'Peligro',
    'ticket.type.POLICE': 'Policía',
    'ticket.type.ROAD_CLOSED': 'Vía Cerrada',
    'ticket.type.ROAD_HAZARD': 'Peligro en la Vía',
    'ticket.type.DISABLED_VEHICLE': 'Vehículo Descompuesto',
    'ticket.type.JAM': 'Embotellamiento',
    'ticket.type.WEATHERHAZARD': 'Peligro Climático',
    'ticket.type.CONSTRUCTION': 'Construcción',
    'ticket.type.OBJECT_IN_ROADWAY': 'Objeto en la Vía',
    
    // Device Types
    'device.type.CAMERA': 'Cámara',
    'device.type.TRAFFIC_LIGHT': 'Semáforo',
    'device.type.SENSOR': 'Sensor',
    'device.type.COUNTING_CAMERA': 'Cámara de Conteo',
    
    // Settings
    'settings.language': 'Idioma',
    'settings.selectLanguage': 'Seleccionar Idioma',
    'settings.spanish': 'Español',
    'settings.english': 'English',
    'settings.saveChanges': 'Guardar Cambios',
    'settings.changesSaved': 'Cambios guardados correctamente',
  },
  en: {
    // Navigation
    'nav.map': 'Map',
    'nav.dashboard': 'Dashboard',
    'nav.tickets': 'Tickets',
    'nav.reports': 'Reports',
    'nav.admin': 'Administration',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'DASHBOARD',
    'dashboard.activeIncidents': 'Active Incidents',
    'dashboard.openTickets': 'Open Tickets',
    'dashboard.inProgress': 'In Progress',
    'dashboard.avgTime': 'Average Time',
    'dashboard.realTime': 'Real time',
    'dashboard.pending': 'Pending attention',
    'dashboard.beingAttended': 'Being attended',
    'dashboard.resolution': 'Ticket resolution',
    'dashboard.ticketStatus': 'Ticket Status',
    'dashboard.open': 'Open',
    'dashboard.closed': 'Closed',
    'dashboard.incidentsByType': 'Incidents by Type',
    'dashboard.deviceStatus': 'Device Status',
    'dashboard.active': 'Active',
    'dashboard.maintenance': 'Maintenance',
    'dashboard.inactive': 'Inactive',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.noActivity': 'No recent activity',
    'dashboard.today': 'Today',
    'dashboard.week': 'Week',
    'dashboard.month': 'Month',
    'dashboard.statistics': 'Statistics',
    'dashboard.lastWeek': 'Last Week',
    'dashboard.lastMonth': 'Last Month',
    
    // Reports
    'reports.title': 'REPORTS',
    'reports.filters': 'Filters',
    'reports.reportType': 'Report Type',
    'reports.startDate': 'Start Date',
    'reports.endDate': 'End Date',
    'reports.generate': 'Generate Report',
    'reports.generating': 'Generating...',
    'reports.export': 'Export',
    'reports.exportExcel': 'Export to Excel',
    'reports.exportPDF': 'Export to PDF',
    'reports.records': 'records',
    'reports.record': 'record',
    'reports.tickets': 'Tickets Report',
    'reports.incidents': 'Incidents Report',
    'reports.devices': 'Devices Report',
    'reports.ticketsDesc': 'Includes status, priority, resolution times, assignments and description of each ticket.',
    'reports.incidentsDesc': 'List of incidents by type, location, priority and reliability in the selected period.',
    'reports.devicesDesc': 'Complete inventory of peripherals with operational status, location and installation data.',
    'reports.selectFilters': 'Select filters and click "Generate Report" to view data',
    
    // Report Fields
    'field.id': 'ID',
    'field.uuid': 'UUID',
    'field.title': 'Title',
    'field.description': 'Description',
    'field.status': 'Status',
    'field.priority': 'Priority',
    'field.source': 'Source',
    'field.incidentType': 'Incident Type',
    'field.createdBy': 'Created by',
    'field.assignedTo': 'Assigned to',
    'field.createdAt': 'Created At',
    'field.updatedAt': 'Last Update',
    'field.resolutionTime': 'Resolution Time (hours)',
    'field.type': 'Type',
    'field.category': 'Category',
    'field.city': 'City',
    'field.street': 'Street',
    'field.latitude': 'Latitude',
    'field.longitude': 'Longitude',
    'field.reliability': 'Reliability',
    'field.datetime': 'Date/Time',
    'field.brand': 'Brand',
    'field.installYear': 'Installation Year',
    'field.manufactureYear': 'Manufacturing Year',
    'field.ipAddress': 'IP Address',
    'field.username': 'Username',
    'field.na': 'N/A',
    'field.unassigned': 'Unassigned',
    
    // Ticket Types (keep original or translate)
    'ticket.type.ACCIDENT': 'Accident',
    'ticket.type.CONGESTION': 'Congestion',
    'ticket.type.HAZARD': 'Hazard',
    'ticket.type.POLICE': 'Police',
    'ticket.type.ROAD_CLOSED': 'Road Closed',
    'ticket.type.ROAD_HAZARD': 'Road Hazard',
    'ticket.type.DISABLED_VEHICLE': 'Disabled Vehicle',
    'ticket.type.JAM': 'Traffic Jam',
    'ticket.type.WEATHERHAZARD': 'Weather Hazard',
    'ticket.type.CONSTRUCTION': 'Construction',
    'ticket.type.OBJECT_IN_ROADWAY': 'Object in Roadway',
    
    // Device Types
    'device.type.CAMERA': 'Camera',
    'device.type.TRAFFIC_LIGHT': 'Traffic Light',
    'device.type.SENSOR': 'Sensor',
    'device.type.COUNTING_CAMERA': 'Counting Camera',
    
    // Settings
    'settings.language': 'Language',
    'settings.selectLanguage': 'Select Language',
    'settings.spanish': 'Español',
    'settings.english': 'English',
    'settings.saveChanges': 'Save Changes',
    'settings.changesSaved': 'Changes saved successfully',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>;
    return translation[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
