import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
        
        <div className="not-found-actions">
          <Link to="/dashboard" className="btn-primary">
            <i className="ri-home-line"></i>
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <i className="ri-arrow-left-line"></i>
            Go Back
          </button>
        </div>
        
        <div className="help-links">
          <p>Need help? Try these:</p>
          <ul>
            <li><Link to="/doctors">Find Doctors</Link></li>
            <li><Link to="/appointments">My Appointments</Link></li>
            <li><Link to="/documents">My Documents</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NotFound;