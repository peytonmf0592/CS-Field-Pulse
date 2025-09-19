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
