import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Franchise() {
  const [items, setItems] = useState<any[]>([])
  const [financial, setFinancial] = useState<any>(null)
  const [projection, setProjection] = useState<any>(null)
  const [tab, setTab] = useState<'checklist'|'financial'>('checklist')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<any>({category:'operations', task:'', priority:'medium'})

  const load = async () => {
    const [c, f] = await Promise.all([axios.get(`${API}/franchise/checklist`), axios.get(`${API}/franchise/financial`)])
    setItems(c.data);
    if(f.data.length>0){
      setFinancial(f.data[0])
      const proj = await axios.get(`${API}/franchise/financial/${f.data[0].id}/projection`)
      setProjection(proj.data)
    }
  }
  useEffect(()=>{load()},[])

  const toggle = async (item:any) => {
    await axios.put(`${API}/franchise/checklist/${item.id}`, {is_completed:!item.is_completed}); load()
  }

  const saveFinancial = async () => {
    if(!financial) return
    await axios.put(`${API}/franchise/financial/${financial.id}`, financial)
    const proj = await axios.get(`${API}/franchise/financial/${financial.id}/projection`)
    setProjection(proj.data)
    alert('Financial model saved')
  }

  const addTask = async () => {
    await axios.post(`${API}/franchise/checklist`, form); setShowNew(false); setForm({category:'operations', task:'', priority:'medium'}); load()
  }

  const completed = items.filter((i:any)=>i.is_completed).length
  const percent = items.length? Math.round(completed/items.length*100):0

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Franchise Prep</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">Phase 8 - Checklist + Financial Model + ROI • {percent}% ready</p>
        </div>
        <div className="flex gap-2 bg-[#111]/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-full">
          <button onClick={()=>setTab('checklist')} className={`px-5 py-2 rounded-full text-xs font-bold transition ${tab==='checklist'?'bg-[#C9A86A] text-black':'text-[#666] hover:text-white'}`}>Checklist {percent}%</button>
          <button onClick={()=>setTab('financial')} className={`px-5 py-2 rounded-full text-xs font-bold transition ${tab==='financial'?'bg-white text-black':'text-[#666] hover:text-white'}`}>Financial Model</button>
        </div>
      </div>

      {tab==='checklist' && (
        <div className="relative z-10">
          <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6 shadow-2xl">
            <div className="flex justify-between text-xs uppercase tracking-widest mb-3"><span className="text-[#666]">Franchise Readiness</span><span className="text-[#C9A86A] font-bold">{percent}%</span></div>
            <div className="w-full bg-[#0A0A0A] border border-white/5 rounded-full h-3 overflow-hidden"><div className="bg-gradient-to-r from-[#C9A86A] to-[#D8B87A] h-3 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(201,168,106,0.4)]" style={{width:`${percent}%`}}></div></div>
          </div>
          <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between bg-[#0A0A0A]/50"><h3 className="font-bold text-xs uppercase tracking-widest">Tasks ({items.length})</h3><button onClick={()=>setShowNew(true)} className="px-4 py-1.5 bg-[#C9A86A] text-black rounded-full text-xs font-bold">+ Task</button></div>
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left">Done</th><th>Category</th><th>Task</th><th>Priority</th></tr></thead>
              <tbody>
                {items.map((it:any)=><tr key={it.id} className={`border-t border-white/5 hover:bg-white/[0.03] transition ${it.is_completed?'bg-[#C9A86A]/5':''}`}><td className="p-4"><input type="checkbox" checked={it.is_completed} onChange={()=>toggle(it)} className="w-5 h-5 accent-[#C9A86A] bg-black border border-white/10 rounded"/></td><td><span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text- uppercase tracking-widest">{it.category}</span></td><td className={`${it.is_completed?'line-through text-[#444]':'text-white/80'}`}>{it.task}</td><td><span className={`px-2.5 py-1 rounded-full text- uppercase border ${it.priority==='high'?'bg-red-500/10 text-red-400 border-red-500/20':'bg-white/5 text-[#666] border-white/10'}`}>{it.priority}</span></td></tr>)}
                {items.length===0 && <tr><td colSpan={4} className="p-16 text-center text-[#444] italic">No tasks — add first task ✨</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='financial' && financial && (
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold mb-6">Edit Franchise Model — Investor Ready</h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3"><div><label className="text- uppercase tracking-widest text-[#666]">Franchise Fee</label><input type="number" value={financial.franchise_fee} onChange={e=>setFinancial({...financial, franchise_fee:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1 focus:border-[#C9A86A]/50 outline-none"/></div><div><label className="text- uppercase tracking-widest text-[#666]">Royalty %</label><input type="number" value={financial.royalty_percent} onChange={e=>setFinancial({...financial, royalty_percent:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="text- uppercase tracking-widest text-[#666]">Equipment $</label><input type="number" value={financial.initial_equipment} onChange={e=>setFinancial({...financial, initial_equipment:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div><div><label className="text- uppercase tracking-widest text-[#666]">Avg Order $</label><input type="number" value={financial.avg_order_value} onChange={e=>setFinancial({...financial, avg_order_value:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="text- uppercase tracking-widest text-[#666]">Orders / day</label><input type="number" value={financial.orders_per_day} onChange={e=>setFinancial({...financial, orders_per_day:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div><div><label className="text- uppercase tracking-widest text-[#666]">COGS %</label><input type="number" value={financial.cogs_percent} onChange={e=>setFinancial({...financial, cogs_percent:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="text- uppercase tracking-widest text-[#666]">Rent / month</label><input type="number" value={financial.monthly_rent} onChange={e=>setFinancial({...financial, monthly_rent:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div><div><label className="text- uppercase tracking-widest text-[#666]">Staff / month</label><input type="number" value={financial.monthly_staff_cost} onChange={e=>setFinancial({...financial, monthly_staff_cost:Number(e.target.value)})} className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1"/></div></div>
              <button onClick={saveFinancial} className="w-full bg-[#C9A86A] text-black py-3.5 rounded-full mt-3 font-bold hover:bg-[#D8B87A] shadow-[0_0_20px_rgba(201,168,106,0.3)]">Save & Recalculate ROI</button>
            </div>
          </div>

          {projection && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#1A1500] to-black text-white rounded-2xl p-6 border border-[#C9A86A]/20 shadow-2xl">
                <h3 className="text- text-[#C9A86A]/60 uppercase tracking-[0.2em] mb-3">Franchise Projection</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">${projection.monthly_revenue}/mo Revenue</p>
                <p className="text-xs text-[#666] mt-2">{financial.orders_per_day} orders/day × ${financial.avg_order_value} × 30 days</p>
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="bg-[#111]/60 border border-white/5 p-4 rounded-2xl"><p className="text- uppercase text-[#666]">Monthly Profit</p><p className="text-xl font-bold text-emerald-400 mt-1">${projection.monthly_profit}</p></div>
                  <div className="bg-[#111]/60 border border-white/5 p-4 rounded-2xl"><p className="text- uppercase text-[#666]">Yearly Profit</p><p className="text-xl font-bold mt-1">${projection.yearly_profit}</p></div>
                  <div className="bg-[#111]/60 border border-white/5 p-4 rounded-2xl"><p className="text- uppercase text-[#666]">ROI in</p><p className="text-xl font-bold text-[#C9A86A] mt-1">{projection.roi_months} months</p></div>
                  <div className="bg-[#111]/60 border border-white/5 p-4 rounded-2xl"><p className="text- uppercase text-[#666]">Margin</p><p className="text-xl font-bold mt-1">{projection.profit_margin}%</p></div>
                </div>
              </div>
              <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5 text-sm shadow-xl">
                <h4 className="font-bold mb-4 text-xs uppercase tracking-widest">Monthly Breakdown</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-[#666]">Revenue</span><span className="font-bold">${projection.monthly_revenue}</span></div>
                  <div className="flex justify-between text-[#666]"><span>COGS ({financial.cogs_percent}%)</span><span>-${projection.monthly_cogs}</span></div>
                  <div className="flex justify-between text-[#666]"><span>Royalty ({financial.royalty_percent}%)</span><span>-${projection.royalty}</span></div>
                  <div className="flex justify-between text-[#666]"><span>Marketing ({financial.marketing_percent}%)</span><span>-${projection.marketing_fee}</span></div>
                  <div className="flex justify-between text-[#666]"><span>Rent</span><span>-${projection.rent}</span></div>
                  <div className="flex justify-between text-[#666]"><span>Staff</span><span>-${projection.staff}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-3 font-bold"><span>Total Costs</span><span>-${projection.total_costs}</span></div>
                  <div className="flex justify-between text-emerald-400 font-bold text-base bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mt-2"><span>Profit</span><span>${projection.monthly_profit}</span></div>
                  <div className="border-t border-white/5 pt-3 mt-3"><p className="text- text-[#555]">Initial Investment: ${projection.initial_investment} (Fee ${financial.franchise_fee} + Equipment ${financial.initial_equipment} + Inventory ${financial.initial_inventory})</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w- shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold">New Task</h3>
            <div className="space-y-3 mt-4"><input value={form.task} onChange={e=>setForm({...form, task:e.target.value})} placeholder="Task" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm"/>
            <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm"><option value="legal">Legal</option><option value="operations">Operations</option><option value="branding">Branding</option><option value="training">Training</option><option value="finance">Finance</option></select></div>
            <div className="flex gap-2 mt-6"><button onClick={()=>setShowNew(false)} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={addTask} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">Add</button></div>
          </div>
        </div>
      )}
    </div>
  )
}