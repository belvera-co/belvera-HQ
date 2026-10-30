import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Production() {
  const [batches, setBatches] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<any>({product_id:'', quantity_tubs:20})
  const [label, setLabel] = useState<any>(null)

  const load = async () => {
    try {
      const [b, p] = await Promise.all([axios.get(`${API}/batches`), axios.get(`${API}/products/`)])
      setBatches(b.data); setProducts(p.data)
    } catch(e){ console.log(e) }
  }
  useEffect(()=>{load()},[])

  const createBatch = async () => {
    if(!form.product_id){ alert("Select product"); return }
    await axios.post(`${API}/batches`, {
      product_id: form.product_id,
      quantity_tubs: Number(form.quantity_tubs),
      tub_size_grams: 500,
      packaging_cost_per_tub: 0.8,
      labor_cost: 15,
      status:'planned',
      batch_number: `BV-${Date.now().toString().slice(-6)}`
    })
    setShowNew(false); setForm({product_id:'', quantity_tubs:20}); load()
  }

  const printLabel = async (batchId:string) => {
    const res = await axios.get(`${API}/labels/batch/${batchId}`)
    const b = batches.find((x:any)=>x.id===batchId)
    res.data.quantity_tubs = res.data.quantity_tubs || res.data.batch_size || b?.quantity_tubs || 0
    res.data.batch_size = res.data.quantity_tubs
    setLabel(res.data)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Production</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">Batches + AI COGS + Custom Labels • {batches.length} batches</p>
        </div>
        <button onClick={()=>setShowNew(true)} className="px-6 py-3 bg-[#C9A86A] text-black rounded-full text-sm font-bold shadow-[0_0_25px_rgba(201,168,106,0.4)] hover:bg-[#D8B87A]">+ New Batch</button>
      </div>

      <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        <div className="p-5 border-b border-white/5 bg-[#0A0A0A]/50 flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-widest">Production Batches</h3>
          <span className="text- bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[#666]">{batches.length} batches</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left">Batch #</th><th className="text-center">Product</th><th className="text-center">Size</th><th className="text-center">Status</th><th className="text-center">Date</th><th className="text-center">Action</th></tr></thead>
          <tbody>
            {batches.map((b:any)=>(
              <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.03] hover:border-l-2 hover:border-l-[#C9A86A] transition">
                <td className="p-4 font-mono font-bold text-[#C9A86A]">{b.batch_number||b.id.substring(0,8)}</td>
                <td className="text-center text-white/80">{b.product_name || products.find((p:any)=>p.id===b.product_id)?.name || b.product_id?.substring(0,8)}</td>
                <td className="text-center font-bold">{b.quantity_tubs || b.batch_size || 0} tubs</td>
                <td className="text-center"><span className={`px-3 py-1 rounded-full text- uppercase tracking-widest border ${b.status==='completed'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{b.status}</span></td>
                <td className="text-center text-xs text-[#666]">{b.created_at?.substring(0,10)}</td>
                <td className="text-center"><button onClick={()=>printLabel(b.id)} className="text-xs bg-white text-black px-4 py-1.5 rounded-full font-bold hover:bg-[#C9A86A] transition">Print Label</button></td>
              </tr>
            ))}
            {batches.length===0 && <tr><td colSpan={6} className="p-16 text-center text-[#444] italic">No batches yet — create first batch ✨</td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w- shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold mb-5">New Production Batch</h3>
            <div className="space-y-3">
              <select value={form.product_id} onChange={e=>setForm({...form, product_id:e.target.value})} className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white">
                <option value="">Select Product</option>
                {products.map((p:any)=><option key={p.id} value={p.id}>{p.name} - {p.product_code || ''}</option>)}
              </select>
              <input type="number" value={form.quantity_tubs} onChange={e=>setForm({...form, quantity_tubs:Number(e.target.value)})} placeholder="Tubs qty (e.g. 20)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none"/>
              <p className="text-xs text-[#666] bg-[#0A0A0A] border border-white/5 p-3 rounded-full">Will auto-deduct ingredients & calculate AI COGS</p>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>setShowNew(false)} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={createBatch} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">Create Batch</button></div>
          </div>
        </div>
      )}

      {label && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#C9A86A]/30 rounded- p-8 w- shadow-[0_0_40px_rgba(201,168,106,0.2)]">
            <div className="text-center border-b border-white/10 pb-4 mb-4">
              <h2 className="text-2xl font-serif italic font-black bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">{label.company_name || "BELVERA"}</h2>
              {label.tagline? <p className="text- tracking-[0.3em] uppercase text-[#C9A86A]/60 mt-1">{label.tagline}</p> : null}
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Product:</span><span className="font-bold">{label.product_name}</span></div>
              <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Batch #:</span><span className="font-mono font-bold text-[#C9A86A]">{label.batch_number}</span></div>
              <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Version:</span><span>{label.version}</span></div>
              <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Size:</span><span className="font-bold">{label.quantity_tubs || label.batch_size} tubs ({label.tub_size_grams || 500}g)</span></div>
              <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Produced:</span><span>{label.production_date?.substring(0,10)}</span></div>
              <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Expiry:</span><span className="font-bold text-red-400">{new Date(label.expiry_date).toISOString().substring(0,10)}</span></div>
              {label.cost_per_tub? <div className="flex justify-between"><span className="text-[#666] text-xs uppercase">Cost:</span><span className="font-bold text-[#C9A86A]">${label.cost_per_tub}/tub</span></div> : null}
              <div className="mt-3 p-3 bg-[#0A0A0A] border border-white/5 rounded-2xl text-xs"><p className="font-bold text-[#C9A86A] text- uppercase tracking-widest">Ingredients:</p><p className="mt-1 text-white/70">{label.ingredients}</p></div>
              <div className="mt-2 p-3 bg-[#C9A86A]/10 border border-[#C9A86A]/20 rounded-2xl text-xs text-[#C9A86A]">{label.storage}</div>
              <div className="mt-4 p-3 bg-black border border-white/10 rounded-xl text-center font-mono text-xs text-white/60">QR: {label.qr_data}</div>
              {label.ai_flag && <div className="mt-2 text-xs text-center text-[#666]">{label.ai_flag} - {label.ai_insight}</div>}
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>setLabel(null)} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Close</button><button onClick={()=>window.print()} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">Print Label</button></div>
          </div>
        </div>
      )}
    </div>
  )
}