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
