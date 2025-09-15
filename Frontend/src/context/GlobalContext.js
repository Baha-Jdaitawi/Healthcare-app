import { AuthProvider } from './AuthContext.js';
import { AppointmentsProvider } from './AppointmentsContext.js';
import { DocumentsProvider } from './DocumentsContext.js';

export function GlobalProvider({ children }) {
  return (
    <AuthProvider>
      <AppointmentsProvider>
        <DocumentsProvider>
          {children}
        </DocumentsProvider>
      </AppointmentsProvider>
    </AuthProvider>
  );
}

// Export hooks
export { useAuth } from './AuthContext.js';
export { useAppointments } from './AppointmentsContext.js';
export { useDocuments } from './DocumentsContext.js';