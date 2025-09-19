// ==== REACT COMPONENTS FOR ADJUSTER DASHBOARD ====
// This file contains all React components for the Adjuster Dashboard application
// You can copy this code into your WordPress site using a React integration plugin

// ==== App.js ====
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

// ==== Layout.js ====
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

// ==== Navbar.js ====
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Navbar() {
  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex flex-1">
            <div className="flex w-full md:ml-0">
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  className="block h-full w-full border-transparent py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Search adjusters..."
                  type="search"
                />
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span className="ml-2 hidden md:block text-gray-700">Tom Cook</span>
                  <ChevronDownIcon className="ml-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Settings
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Sign out
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

// ==== Sidebar.js ====
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Sidebar() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Adjusters', href: '/adjusters', icon: UserGroupIcon },
    { name: 'Encounters', href: '/encounters', icon: ClipboardDocumentListIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-xl font-bold text-primary-600">Adjuster Dashboard</h1>
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => {
              const current = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    current
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

// ==== Dashboard.js ====
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

// ==== StatsCard.js ====
function StatsCard({ name, value, icon: Icon, change, trend }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">
        <div className="flex items-center">
          <Icon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
          {name}
        </div>
      </dt>
      <dd className="mt-1">
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p
            className={`ml-2 flex items-baseline text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend === 'up' ? (
              <span className="flex items-center">
                <span className="sr-only">Increased by</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {change}
              </span>
            ) : (
              <span className="flex items-center">
                <span className="sr-only">Decreased by</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {change}
              </span>
            )}
          </p>
        </div>
      </dd>
    </div>
  );
}

export default StatsCard;

// ==== RecentEncounters.js ====
import { Link } from 'react-router-dom';

// Demo data for recent encounters
const recentEncounters = [
  {
    id: 1,
    adjuster: { id: 101, name: 'John Smith' },
    carrier: 'State Farm',
    date: '2025-04-02',
    sentiment: 'positive',
    notes: 'Adjuster was very helpful and approved all line items.'
  },
  {
    id: 2,
    adjuster: { id: 102, name: 'Sarah Johnson' },
    carrier: 'Allstate',
    date: '2025-04-01',
    sentiment: 'neutral',
    notes: 'Standard claim process, no issues but some delays noted.'
  },
  {
    id: 3,
    adjuster: { id: 103, name: 'Michael Williams' },
    carrier: 'Progressive',
    date: '2025-03-31',
    sentiment: 'negative',
    notes: 'Adjuster disputed several line items and was slow to respond.'
  },
  {
    id: 4,
    adjuster: { id: 104, name: 'Jessica Brown' },
    carrier: 'Liberty Mutual',
    date: '2025-03-30',
    sentiment: 'positive',
    notes: 'Quick approval and great communication throughout.'
  },
  {
    id: 5,
    adjuster: { id: 105, name: 'David Miller' },
    carrier: 'Farmers',
    date: '2025-03-29',
    sentiment: 'neutral',
    notes: 'Standard process with normal timeline.'
  },
];

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function RecentEncounters() {
  return (
    <div className="mt-4 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Adjuster</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Carrier</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEncounters.map((encounter) => (
                <tr key={encounter.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-0">
                    <Link to={`/adjusters/${encounter.adjuster.id}`}>
                      {encounter.adjuster.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{encounter.carrier}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{encounter.date}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getSentimentColor(encounter.sentiment)}`}>
                      {encounter.sentiment.charAt(0).toUpperCase() + encounter.sentiment.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <Link to="/encounters" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all encounters
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentEncounters;

// ==== CarrierDistribution.js ====
// Demo data for carrier distribution
const carrierData = [
  { name: 'State Farm', count: 28, color: 'bg-red-200' },
  { name: 'Allstate', count: 22, color: 'bg-blue-200' },
  { name: 'Progressive', count: 18, color: 'bg-purple-200' },
  { name: 'Liberty Mutual', count: 15, color: 'bg-yellow-200' },
  { name: 'Farmers', count: 12, color: 'bg-green-200' },
  { name: 'USAA', count: 10, color: 'bg-indigo-200' },
  { name: 'Nationwide', count: 8, color: 'bg-pink-200' },
  { name: 'Others', count: 11, color: 'bg-gray-200' },
];

function CarrierDistribution() {
  // Calculate total for percentages
  const total = carrierData.reduce((sum, carrier) => sum + carrier.count, 0);
  
  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-4">
        {carrierData.map((carrier) => {
          const percentage = Math.round((carrier.count / total) * 100);
          
          return (
            <div key={carrier.name} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">{carrier.name}</div>
              <div className="flex-1 ml-2">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${carrier.color}`}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="w-12 text-right text-sm text-gray-600 ml-2">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CarrierDistribution;

// ==== AdjusterList.js ====
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

// Demo data for adjusters
const adjusters = [
  {
    id: 101,
    name: 'John Smith',
    carrier: 'State Farm',
    email: 'john.smith@statefarm.com',
    phone: '(555) 123-4567',
    region: 'Northeast',
    totalClaims: 87,
    cat: true,
    sentiment: 'positive',
    lastEncounter: '2025-04-02',
  },
  {
    id: 102,
    name: 'Sarah Johnson',
    carrier: 'Allstate',
    email: 'sarah.j@allstate.com',
    phone: '(555) 987-6543',
    region: 'Midwest',
    totalClaims: 62,
    cat: false,
    sentiment: 'neutral',
    lastEncounter: '2025-04-01',
  },
  {
    id: 103,
    name: 'Michael Williams',
    carrier: 'Progressive',
    email: 'm.williams@progressive.com',
    phone: '(555) 789-0123',
    region: 'South',
    totalClaims: 41,
    cat: false,
    sentiment: 'negative',
    lastEncounter: '2025-03-31',
  },
  {
    id: 104,
    name: 'Jessica Brown',
    carrier: 'Liberty Mutual',
    email: 'jbrown@libertymutual.com',
    phone: '(555) 321-6547',
    region: 'West',
    totalClaims: 55,
    cat: true,
    sentiment: 'positive',
    lastEncounter: '2025-03-30',
  },
  {
    id: 105,
    name: 'David Miller',
    carrier: 'Farmers',
    email: 'david.m@farmers.com',
    phone: '(555) 456-7890',
    region: 'Southeast',
    totalClaims: 35,
    cat: false,
    sentiment: 'neutral',
    lastEncounter: '2025-03-29',
  },
  {
    id: 106,
    name: 'Emily Davis',
    carrier: 'USAA',
    email: 'e.davis@usaa.com',
    phone: '(555) 234-5678',
    region: 'Southwest',
    totalClaims: 29,
    cat: true,
    sentiment: 'positive',
    lastEncounter: '2025-03-28',
  },
  {
    id: 107,
    name: 'Robert Wilson',
    carrier: 'Nationwide',
    email: 'rwilson@nationwide.com',
    phone: '(555) 876-5432',
    region: 'Midwest',
    totalClaims: 47,
    cat: false,
    sentiment: 'negative',
    lastEncounter: '2025-03-27',
  },
  {
    id: 108,
    name: 'Lisa Martinez',
    carrier: 'State Farm',
    email: 'lisa.m@statefarm.com',
    phone: '(555) 654-3210',
    region: 'Northeast',
    totalClaims: 61,
    cat: true,
    sentiment: 'positive',
    lastEncounter: '2025-03-26',
  },
];

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function AdjusterList() {
  const [sortField, setSortField] = useState('lastEncounter');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrier, setFilterCarrier] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterCAT, setFilterCAT] = useState('');

  // Handle sort
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
    ) : (
      <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
    );
  };

  // Filter and sort adjusters
  const filteredAdjusters = adjusters
    .filter((adjuster) => {
      const matchesSearch = searchTerm === '' || 
        adjuster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adjuster.carrier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCarrier = filterCarrier === '' || adjuster.carrier === filterCarrier;
      const matchesSentiment = filterSentiment === '' || adjuster.sentiment === filterSentiment;
      const matchesCAT = filterCAT === '' || 
        (filterCAT === 'true' && adjuster.cat) || 
        (filterCAT === 'false' && !adjuster.cat);
      
      return matchesSearch && matchesCarrier && matchesSentiment && matchesCAT;
    })
    .sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Get unique carriers for filter
  const carriers = [...new Set(adjusters.map((adjuster) => adjuster.carrier))];

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Adjusters</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all insurance adjusters you are tracking including their carrier, contact details, and sentiment.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/adjusters/add"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Add adjuster
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <div className="relative rounded-md shadow-sm w-full sm:w-64">
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Search adjusters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
            <select
              id="carrier-filter"
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              value={filterCarrier}
              onChange={(e) => setFilterCarrier(e.target.value)}
            >
              <option value="">All Carriers</option>
              {carriers.map((carrier) => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
            
            <select
              id="sentiment-filter"
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            
            <select
              id="cat-filter"
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              value={filterCAT}
              onChange={(e) => setFilterCAT(e.target.value)}
            >
              <option value="">All Adjusters</option>
              <option value="true">CAT Only</option>
              <option value="false">Non-CAT Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    <span className="ml-1">{getSortIcon('name')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('carrier')}
                >
                  <div className="flex items-center">
                    <span>Carrier</span>
                    <span className="ml-1">{getSortIcon('carrier')}</span>
                  </div>
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contact
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('totalClaims')}
                >
                  <div className="flex items-center">
                    <span>Claims</span>
                    <span className="ml-1">{getSortIcon('totalClaims')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('cat')}
                >
                  <div className="flex items-center">
                    <span>CAT</span>
                    <span className="ml-1">{getSortIcon('cat')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('sentiment')}
                >
                  <div className="flex items-center">
                    <span>Sentiment</span>
                    <span className="ml-1">{getSortIcon('sentiment')}</span>
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('lastEncounter')}
                >
                  <div className="flex items-center">
                    <span>Last Encounter</span>
                    <span className="ml-1">{getSortIcon('lastEncounter')}</span>
                  </div>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAdjusters.map((adjuster) => (
                <tr key={adjuster.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary-600 sm:pl-6">
                    <Link to={`/adjusters/${adjuster.id}`} className="hover:underline">
                      {adjuster.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{adjuster.carrier}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>{adjuster.email}</div>
                    <div>{adjuster.phone}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{adjuster.totalClaims}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {adjuster.cat ? (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                        CAT
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getSentimentColor(adjuster.sentiment)}`}>
                      {adjuster.sentiment.charAt(0).toUpperCase() + adjuster.sentiment.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{adjuster.lastEncounter}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link to={`/adjusters/${adjuster.id}/edit`} className="text-primary-600 hover:text-primary-900 mr-4">
                      Edit
                    </Link>
                    <a href="#" className="text-red-600 hover:text-red-900">
                      Delete
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdjusterList;

// ==== AdjusterDetail.js ====
import { useParams, Link } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import EncounterList from '../encounters/EncounterList';

// Demo data for adjusters
const adjusters = [
  {
    id: 101,
    name: 'John Smith',
    carrier: 'State Farm',
    email: 'john.smith@statefarm.com',
    phone: '(555) 123-4567',
    region: 'Northeast',
    address: '123 Main St, Boston, MA 02108',
    totalClaims: 87,
    cat: true,
    sentiment: 'positive',
    lastEncounter: '2025-04-02',
    notes: 'Very responsive and easy to work with. Prefers email communication.',
    encounters: [
      {
        id: 1,
        date: '2025-04-02',
        type: 'phone',
        sentiment: 'positive',
        notes: 'Adjuster was very helpful and approved all line items.'
      },
      {
        id: 2,
        date: '2025-03-15',
        type: 'email',
        sentiment: 'positive',
        notes: 'Quick response with approval for emergency services.'
      },
      {
        id: 3,
        date: '2025-02-28',
        type: 'in-person',
        sentiment: 'neutral',
        notes: 'Standard inspection, no major issues but requested additional documentation.'
      }
    ]
  },
  {
    id: 102,
    name: 'Sarah Johnson',
    carrier: 'Allstate',
    email: 'sarah.j@allstate.com',
    phone: '(555) 987-6543',
    region: 'Midwest',
    address: '456 Oak Ave, Chicago, IL 60601',
    totalClaims: 62,
    cat: false,
    sentiment: 'neutral',
    lastEncounter: '2025-04-01',
    notes: 'Thorough in reviews. May need extra documentation for approval.',
    encounters: [
      {
        id: 4,
        date: '2025-04-01',
        type: 'email',
        sentiment: 'neutral',
        notes: 'Standard claim process, no issues but some delays noted.'
      },
      {
        id: 5,
        date: '2025-03-22',
        type: 'phone',
        sentiment: 'positive',
        notes: 'Follow-up call went well, received approval for additional items.'
      }
    ]
  },
];

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function AdjusterDetail() {
  const { id } = useParams();
  const adjusterId = parseInt(id, 10);
  
  // Find the adjuster by ID
  const adjuster = adjusters.find(adj => adj.id === adjusterId);
  
  if (!adjuster) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Adjuster not found</h2>
        <p className="mt-2 text-gray-600">The adjuster you're looking for does not exist.</p>
        <Link
          to="/adjusters"
          className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
        >
          Back to adjusters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{adjuster.name}</h1>
        <div>
          <Link
            to={`/adjusters/${adjuster.id}/edit`}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mr-3"
          >
            Edit
          </Link>
          <Link
            to="/adjusters"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          >
            Back to adjusters
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Adjuster Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{adjuster.carrier}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getSentimentColor(adjuster.sentiment)}`}>
                {adjuster.sentiment.charAt(0).toUpperCase() + adjuster.sentiment.slice(1)}
              </span>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <a href={`mailto:${adjuster.email}`} className="text-primary-600 hover:underline">
                      {adjuster.email}
                    </a>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <a href={`tel:${adjuster.phone}`} className="text-primary-600 hover:underline">
                      {adjuster.phone}
                    </a>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Region
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {adjuster.region}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {adjuster.address}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Total Claims
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {adjuster.totalClaims}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">CAT Adjuster</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {adjuster.cat ? (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                        Yes - CAT
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        No
                      </span>
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {adjuster.notes}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Encounters</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest encounters with this adjuster</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <EncounterList encounters={adjuster.encounters} adjusterId={adjuster.id} />
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                  >
                    Log New Encounter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Sentiment Tracking</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Adjuster's sentiment over time</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-500 mb-4">Sentiment data visualization would go here</p>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">60%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-gray-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">30%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-red-500 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
                >
                  Log New Encounter
                </button>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Send Email
                </button>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdjusterDetail;

// ==== AdjusterForm.js ====
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Demo data for adjusters
const adjusters = [
  {
    id: 101,
    name: 'John Smith',
    carrier: 'State Farm',
    email: 'john.smith@statefarm.com',
    phone: '(555) 123-4567',
    region: 'Northeast',
    address: '123 Main St, Boston, MA 02108',
    totalClaims: 87,
    cat: true,
    sentiment: 'positive',
    notes: 'Very responsive and easy to work with. Prefers email communication.',
  },
  {
    id: 102,
    name: 'Sarah Johnson',
    carrier: 'Allstate',
    email: 'sarah.j@allstate.com',
    phone: '(555) 987-6543',
    region: 'Midwest',
    address: '456 Oak Ave, Chicago, IL 60601',
    totalClaims: 62,
    cat: false,
    sentiment: 'neutral',
    notes: 'Thorough in reviews. May need extra documentation for approval.',
  },
];

// Demo data for carriers
const carriers = [
  'State Farm',
  'Allstate',
  'Progressive',
  'Liberty Mutual',
  'Farmers',
  'USAA',
  'Nationwide',
  'Travelers',
  'American Family',
  'Erie Insurance',
];

// Demo data for regions
const regions = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West',
  'Northwest',
  'South',
  'Central',
  'National',
];

function AdjusterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;
  const adjusterId = isEditMode ? parseInt(id, 10) : null;
  
  const emptyForm = {
    name: '',
    carrier: '',
    email: '',
    phone: '',
    region: '',
    address: '',
    totalClaims: 0,
    cat: false,
    sentiment: 'neutral',
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load adjuster data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const adjuster = adjusters.find(adj => adj.id === adjusterId);
      if (adjuster) {
        setFormData(adjuster);
      } else {
        navigate('/adjusters');
      }
    }
  }, [isEditMode, adjusterId, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value, 10) : 
              value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.carrier) {
      newErrors.carrier = 'Carrier is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.region) {
      newErrors.region = 'Region is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/adjusters');
      }, 1000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Adjuster' : 'Add New Adjuster'}
        </h1>
        <Link
          to="/adjusters"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Adjuster Information</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Fill in the details about this insurance adjuster.</p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                    Full name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.name ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="carrier" className="block text-sm font-medium leading-6 text-gray-900">
                    Carrier
                  </label>
                  <div className="mt-2">
                    <select
                      id="carrier"
                      name="carrier"
                      value={formData.carrier}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.carrier ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                    >
                      <option value="">Select carrier</option>
                      {carriers.map(carrier => (
                        <option key={carrier} value={carrier}>{carrier}</option>
                      ))}
                    </select>
                    {errors.carrier && <p className="mt-2 text-sm text-red-600">{errors.carrier}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.email ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                    Phone number
                  </label>
                  <div className="mt-2">
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.phone ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                    />
                    {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
                    Region
                  </label>
                  <div className="mt-2">
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${errors.region ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                    >
                      <option value="">Select region</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    {errors.region && <p className="mt-2 text-sm text-red-600">{errors.region}</p>}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="totalClaims" className="block text-sm font-medium leading-6 text-gray-900">
                    Total Claims
                  </label>
                  <div className="mt-2">
                    <input
                      id="totalClaims"
                      name="totalClaims"
                      type="number"
                      min="0"
                      value={formData.totalClaims}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                    Address
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="sentiment" className="block text-sm font-medium leading-6 text-gray-900">
                    Sentiment
                  </label>
                  <div className="mt-2">
                    <select
                      id="sentiment"
                      name="sentiment"
                      value={formData.sentiment}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <div className="relative flex items-start mt-4">
                    <div className="flex h-6 items-center">
                      <input
                        id="cat"
                        name="cat"
                        type="checkbox"
                        checked={formData.cat}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="cat" className="font-medium text-gray-900">
                        CAT Adjuster
                      </label>
                      <p className="text-gray-500">This adjuster handles catastrophe claims.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
                    Notes
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Write any additional notes about this adjuster.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Link
              to="/adjusters"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Adjuster' : 'Create Adjuster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdjusterForm;

// ==== EncounterList.js ====
import { Link } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';

function getSentimentColor(sentiment) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getEncounterTypeIcon(type) {
  switch (type) {
    case 'phone':
      return <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />;
    case 'email':
      return <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />;
    case 'in-person':
      return <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />;
    default:
      return <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />;
  }
}

function getEncounterTypeText(type) {
  switch (type) {
    case 'phone':
      return 'Phone Call';
    case 'email':
      return 'Email';
    case 'in-person':
      return 'In-Person Meeting';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

function EncounterList({ encounters = [], adjusterId }) {
  if (!encounters || encounters.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No encounters recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {encounters.map((encounter, encounterIdx) => (
          <li key={encounter.id}>
            <div className="relative pb-8">
              {encounterIdx !== encounters.length - 1 ? (
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                    {getEncounterTypeIcon(encounter.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {getEncounterTypeText(encounter.type)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {encounter.date}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{encounter.notes}</p>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getSentimentColor(encounter.sentiment)}`}>
                      {encounter.sentiment.charAt(0).toUpperCase() + encounter.sentiment.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EncounterList;

// ==== CSS (for Tailwind) ====
/*
Add the following CSS to your WordPress site to support the Tailwind classes used in this application:

@tailwind base;
@tailwind components;
@tailwind utilities;

Or use a CDN to include Tailwind CSS:
<script src="https://cdn.tailwindcss.com"></script>

Then configure Tailwind with the primary color used in the application:
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
        },
      },
    },
  }
</script>
*/