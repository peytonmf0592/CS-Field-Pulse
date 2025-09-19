import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';
import AdjusterList from './components/adjusters/AdjusterList';
import AdjusterDetail from './components/adjusters/AdjusterDetail';
import AdjusterForm from './components/adjusters/AdjusterForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="adjusters" element={<AdjusterList />} />
        <Route path="adjusters/:id" element={<AdjusterDetail />} />
        <Route path="adjusters/add" element={<AdjusterForm />} />
        <Route path="adjusters/:id/edit" element={<AdjusterForm />} />
      </Route>
    </Routes>
  );
}

export default App;
