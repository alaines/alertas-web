// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/map');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
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
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger py-2" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                <i className="fas fa-envelope me-2"></i>
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="admin@alertas.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              disabled={loading}
            >
              <i className="fas fa-sign-in-alt me-2"></i>
              {loading ? 'Ingresando...' : 'Ingresar'}
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
