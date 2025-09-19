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
