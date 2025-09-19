import { Link } from 'react-router-dom';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import RecentEncounters from './RecentEncounters';
import CarrierDistribution from './CarrierDistribution';

// Demo data
const stats = [
  { name: 'Total Adjusters', value: '124', icon: UserGroupIcon, change: '12%', trend: 'up' },
  { name: 'Total Carriers', value: '28', icon: BuildingOfficeIcon, change: '2%', trend: 'up' },
  { name: 'Encounters (30d)', value: '342', icon: ClipboardDocumentListIcon, change: '8%', trend: 'up' },
  { name: 'CAT Adjusters', value: '38', icon: UserIcon, change: '5%', trend: 'down' },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          to="/adjusters/add"
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Add Adjuster
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Encounters</h3>
            <RecentEncounters />
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Adjuster Distribution by Carrier</h3>
            <CarrierDistribution />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
