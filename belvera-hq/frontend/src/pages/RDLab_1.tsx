import { useEffect, useState } from 'react'
import axios from 'axios'

export default function RDLab() {
  const [products, setProducts] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/products/').then(r => setProducts(r.data))
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">R&D Laboratory</h1>
          <p className="text-gray-500">Track every experiment. Versioned, scored, repeatable.</p>
        </div>
        <button onClick={()=>{axios.post('http://localhost:8000/seed').then(()=>window.location.reload())}} className="px-4 py-2 bg-belvera-navy text-white rounded-xl text-sm">Seed Demo Data</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-2xl border p-4">
          <h3 className="font-semibold mb-4">Products ({products.length})</h3>
          {products.map(p => (
            <div key={p.id} onClick={()=>setSelected(p)} className={`p-4 mb-2 rounded-xl cursor-pointer border ${selected?.id===p.id?'bg-belvera-navy text-white':'hover:bg-gray-50'}`}>
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs opacity-70">{p.product_code} • {p.collection} • v{p.current_version}</p>
              {p.latest_scores && <p className="text-xs mt-2">Taste {p.latest_scores.taste}/10 • Texture {p.latest_scores.texture}/10</p>}
            </div>
          ))}
        </div>

        <div className="col-span-2 bg-white rounded-2xl border p-6">
          {selected ? (
            <>
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <p className="text-sm text-gray-500">{selected.product_code} | Collection: {selected.collection} | Status: {selected.status}</p>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Score label="Taste" value={selected.latest_scores?.taste ?? 0} />
                <Score label="Texture" value={selected.latest_scores?.texture ?? 0} />
                <Score label="Appearance" value={selected.latest_scores?.appearance ?? 0} />
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <p className="text-xs font-semibold">Latest Testing Notes:</p>
                <p className="text-sm mt-1">Example: Needs stronger strawberry flavor - increase puree by 15% (from seed data)</p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-sm mb-2">Cost Calculator</h4>
                <button onClick={async ()=>{
                  const res = await axios.get(`http://localhost:8000/api/v1/products/${selected.id}/cost`)
                  alert(`Ingredient Cost: $${res.data.cost.ingredient_cost}\nTotal: $${res.data.cost.total_cost}\nPer Serving: $${res.data.cost.cost_per_serving}\nRetail: $${res.data.cost.suggested_retail}\nMargin: ${res.data.cost.profit_margin_percent}%`)
                }} className="px-4 py-2 bg-belvera-blue text-white rounded-lg text-sm">Calculate Profitability</button>
              </div>
            </>
          ) : <p className="text-gray-400">Select a product to view versions and scoring</p>}
        </div>
      </div>
    </div>
  )
}

function Score({ label, value }: any) {
  return <div className="bg-belvera-cream p-4 rounded-xl text-center"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold">{value}/10</p></div>
}
