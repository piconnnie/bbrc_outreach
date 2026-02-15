import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <Layout>
                <Dashboard />
            </Layout>
        </ErrorBoundary>
    );
}

export default App;
