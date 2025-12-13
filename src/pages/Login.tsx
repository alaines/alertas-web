// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de autenticación con API
    // Por ahora, simplemente redirigir al mapa
    navigate('/map');
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/control-center.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}
      />

      {/* Formulario de Login */}
      <div 
        className="card shadow-lg"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          zIndex: 2,
          margin: '20px'
        }}
      >
        <div className="card-body p-4 p-md-5">
          {/* Logo y Título */}
          <div className="text-center mb-4">
            <div 
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                backgroundColor: '#0056b3',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fas fa-map-marker-alt" style={{ fontSize: '40px', color: 'white' }}></i>
            </div>
            <h2 className="mb-2" style={{ fontWeight: '700', color: '#0056b3' }}>
              Sistema de Alertas
            </h2>
            <p className="text-muted mb-0">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Usuario */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                <i className="fas fa-user me-2"></i>
                Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ borderRadius: '8px', padding: '12px' }}
              />
            </div>

            {/* Contraseña */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                <i className="fas fa-lock me-2"></i>
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderRadius: '8px', padding: '12px' }}
              />
            </div>

            {/* Recordar y Olvidaste */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="rememberMe">
                  Recordar contraseña
                </label>
              </div>
              <a 
                href="#" 
                className="small text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Funcionalidad de recuperación de contraseña pendiente');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              style={{ borderRadius: '8px', fontSize: '16px' }}
            >
              <i className="fas fa-sign-in-alt me-2"></i>
              Ingresar
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-4 pt-3 border-top">
            <p className="text-muted small mb-0">
              © 2025 Sistema de Alertas - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
