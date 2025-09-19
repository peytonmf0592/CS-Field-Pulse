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
