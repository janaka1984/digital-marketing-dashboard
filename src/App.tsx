import { AppRoutes } from '@routes/index';
import ErrorBoundary from '@components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
