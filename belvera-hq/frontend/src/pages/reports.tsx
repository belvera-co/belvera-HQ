import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Reports() {
  const [monthly, setMonthly] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [packaging, setPackaging] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [m, inv, pack] = await Promise.all([
        axios.get(`${API}/reports/monthly-pnl`).catch(()=>({data:[]})),
        axios.get(`${API}/ingredients`).catch(()=>({data:[]})),
        axios.get(`${API}/packaging/cost-analysis`).catch(()=>({data:[]})),
      ])
      setMonthly(m.data || []); setInventory(inv.data || []); setPackaging(pack.data || [])
    } catch (e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  const totalInventoryValue = inventory.reduce((s:any,i:any)=> s + (Number(i.stock_quantity)||0)*(Number(i.cost_per_unit)||0), 0)
  const totalPackValue = packaging.reduce((s:any,p:any)=> s + (Number(p.total_value)||0), 0)

  const download = (type:string) => { window.open(`${API}/reports/${type}-csv`, '_blank') }

  if(loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#C9A86A] tracking-widest uppercase text-xs">Loading Reports...</div>

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div><h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Reports & Labels</span></h1><p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">Phase 9 - Export + Packaging Cost + Inventory Valuation</p></div>
        <div className="flex gap-2">
          <button onClick={()=>download('sales')} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs hover:bg-white/10">Sales CSV</button>
          <button onClick={()=>download('expenses')} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs hover:bg-white/10">Expenses CSV</button>
          <button onClick={()=>download('inventory')} className="px-5 py-2.5 bg-[#C9A86A] text-black rounded-full text-xs font-bold shadow-[0_0_20px_rgba(201,168,106,0.3)]">Inventory CSV</button>
        </div>
      </div>

      {error && <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-2xl text-sm text-red-400 mb-6 relative z-10">Error loading: {error}</div>}

      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl hover:border-[#C9A86A]/20 transition"><p className="text- uppercase tracking-widest text-[#666]">Inventory Value</p><p className="text-3xl font-bold mt-2">${totalInventoryValue.toFixed(2)}</p><p className="text-xs text-[#444] mt-1">{inventory.length} ingredients</p></div>
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl"><p className="text- uppercase tracking-widest text-[#666]">Packaging Value</p><p className="text-3xl font-bold mt-2">${totalPackValue.toFixed(2)}</p><p className="text-xs text-[#444] mt-1">{packaging.length} packaging items</p></div>
        <div className="bg-gradient-to-br from-[#1A1500] to-black p-6 rounded-2xl border border-[#C9A86A]/20 shadow-[0_0_30px_rgba(201,168,106,0.15)]"><p className="text- uppercase tracking-widest text-[#C9A86A]/60">Total Stock Value</p><p className="text-3xl font-bold text-[#C9A86A] mt-2">${(totalInventoryValue+totalPackValue).toFixed(2)}</p><p className="text-xs text-[#C9A86A]/40 mt-1">Ready for franchise audit</p></div>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 bg-[#0A0A0A]/50"><h3 className="font-bold text-xs uppercase tracking-widest">Monthly P&L Report</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-3 text-left">Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr></thead>
            <tbody>
              {monthly.length>0? monthly.map((m:any)=><tr key={m.month} className="border-t border-white/5 hover:bg-white/[0.03]"><td className="p-3 text-white/80">Month {m.month}</td><td>${Number(m.revenue||0).toFixed(2)}</td><td className="text-[#666]">${Number(m.expenses||0).toFixed(2)}</td><td className={`font-bold ${m.profit>=0?'text-emerald-400':'text-red-400'}`}>${Number(m.profit||0).toFixed(2)}</td></tr>) : <tr><td colSpan={4} className="p-12 text-center text-[#444] italic text-xs">No P&L data yet - add orders and expenses</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 bg-[#0A0A0A]/50"><h3 className="font-bold text-xs uppercase tracking-widest">Packaging Cost Analysis</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-3 text-left">Packaging</th><th>Cost/unit</th><th>Stock</th><th>Total Value</th></tr></thead>
            <tbody>
              {packaging.length>0? packaging.map((p:any)=><tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.03]"><td className="p-3 font-bold">{p.name}</td><td className="text-[#666]">${p.cost_per_unit}</td><td>{p.stock}</td><td className="font-bold text-[#C9A86A]">${Number(p.total_value||0).toFixed(2)}</td></tr>) : <tr><td colSpan={4} className="p-12 text-center text-[#444] italic text-xs">No packaging yet - add in Suppliers page</td></tr>}
            </tbody>
          </table>
          <div className="p-4 bg-[#C9A86A]/10 border-t border-[#C9A86A]/20 text-xs text-[#C9A86A]"><p className="font-bold uppercase tracking-widest text-">Franchise Tip: $0.30-$0.50 per bowl</p><p className="mt-1 text-[#C9A86A]/60">Add bowls, lids, spoons, sleeves in Suppliers → Packaging</p></div>
        </div>
      </div>

      <div className="mt-6 bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl relative z-10">
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4">Inventory Details ({inventory.length})</h3>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {inventory.map((i:any)=><div key={i.id} className="p-3 bg-[#0A0A0A] border border-white/5 rounded-xl hover:border-[#C9A86A]/20 transition"><p className="font-bold text-white">{i.name}</p><p className="text-[#666] mt-1">Stock: {i.stock_quantity} × ${i.cost_per_unit} = <span className="text-[#C9A86A] font-bold">${(Number(i.stock_quantity||0)*Number(i.cost_per_unit||0)).toFixed(2)}</span></p></div>)}
        </div>
        {inventory.length===0 && <p className="text-xs text-[#444] italic text-center py-10">No ingredients yet - add in Suppliers page</p>}
      </div>
    </div>
  )
}