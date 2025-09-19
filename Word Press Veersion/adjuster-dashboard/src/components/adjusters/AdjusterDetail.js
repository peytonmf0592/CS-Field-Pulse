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
