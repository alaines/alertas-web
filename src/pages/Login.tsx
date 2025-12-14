// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/map');
    } catch (err: any) {
      setError(
        err.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    try {
      // Aquí iría la llamada al endpoint de recuperación de contraseña
      // await authService.forgotPassword(forgotEmail);
      setForgotSuccess('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail('');
        setForgotSuccess('');
      }, 3000);
    } catch (err: any) {
      setForgotError('Error al procesar la solicitud. Por favor intenta nuevamente.');
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
        className="shadow-lg"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          zIndex: 2,
          margin: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <div className="p-4 p-md-5">
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

            {/* Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                <i className="fas fa-user me-2"></i>
                Usuario
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{ borderRadius: '8px', padding: '12px' }}
              />
            </div>

            {/* Contraseña */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                <i className="fas fa-lock me-2"></i>
                Contraseña
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ borderRadius: '8px', padding: '12px', paddingRight: '45px' }}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    top: '50%',
                    right: '8px',
                    transform: 'translateY(-50%)',
                    padding: '4px 8px',
                    color: '#6c757d'
                  }}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
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
                  setShowForgotModal(true);
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

      {/* Modal Recuperar Contraseña */}
      {showForgotModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">
                  <i className="fas fa-key me-2 text-primary"></i>
                  Recuperar Contraseña
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail('');
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                ></button>
              </div>
              <div className="modal-body pt-2">
                <p className="text-muted mb-3">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                </p>

                {forgotSuccess && (
                  <div className="alert alert-success py-2" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {forgotSuccess}
                  </div>
                )}

                {forgotError && (
                  <div className="alert alert-danger py-2" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <div className="mb-3">
                    <label htmlFor="forgotEmail" className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2"></i>
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="forgotEmail"
                      placeholder="correo@ejemplo.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      style={{ borderRadius: '8px', padding: '12px' }}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary py-2 fw-semibold"
                      style={{ borderRadius: '8px' }}
                      disabled={!forgotEmail}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Enviar Instrucciones
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary py-2"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotEmail('');
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
