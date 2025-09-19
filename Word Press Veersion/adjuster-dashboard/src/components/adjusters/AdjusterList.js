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
