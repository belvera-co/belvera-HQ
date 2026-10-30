export default function Franchise() {
  return (
    <div>
      <h1 className="text-3xl">Franchise Preparation Module</h1>
      <p className="text-gray-500 mb-6">Future section - training, store requirements, brand standards</p>
      <div className="bg-white rounded-2xl border p-8">
        <h3 className="font-semibold">Ready for Franchising When You Are</h3>
        <ul className="text-sm mt-4 space-y-2 list-disc pl-5">
          <li>All data is already multi-tenant (organization_id + location_id)</li>
          <li>Add franchise_documents table - training PDFs</li>
          <li>Add equipment_list with mandatory flag</li>
          <li>Add brand_standards with rules</li>
          <li>Frontend role: franchise_owner sees only their location</li>
        </ul>
      </div>
    </div>
  )
}
