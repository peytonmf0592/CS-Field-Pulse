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
