import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
const API = 'http://localhost:8000/api/v1'

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [sales, setSales] = useState<any>(null)
  const [cogs, setCogs] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])

  const load = async () => {
    const [dash, s, c, b] = await Promise.all([
      axios.get(`${API}/dashboard/summary`),
      axios.get(`${API}/sales/summary`).catch(()=>({data:{}})),
      axios.get(`${API}/cogs-analysis`).catch(()=>({data:[]})),
      axios.get(`${API}/batches`).catch(()=>({data:[]}))
    ])
    setSummary(dash.data); setSales(s.data); setCogs(c.data); setBatches(b.data)
  }
  useEffect(()=>{load()},[])

  if(!summary) return <div className="p-12 text-center bg-[#050505] text-white min-h-screen">Loading Belvera HQ...</div>

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      {/* Gold dust orbs */}
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.08] blur- rounded-full pointer-events-none"></div>
      <div className="absolute top- right-[-50px] w- h- bg-red-600 opacity-[0.06] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}>
            <span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">BELVERA HQ Dashboard</span>
          </h1>
          <p className="text-[#666] text-sm mt-2 tracking-widest uppercase">Phase 12 — Complete • Italian Luxury</p>
        </div>
        <div className="flex gap-3">
          <Link to="/production" className="px-5 py-2.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full text-sm hover:bg-white/10 hover:border-[#C9A86A]/50 transition-all">+ New Batch</Link>
          <Link to="/orders" className="px-5 py-2.5 bg-[#C9A86A] text-black rounded-full text-sm font-bold hover:bg-[#D8B87A] shadow-[0_0_20px_rgba(201,168,106,0.3)] transition-all">+ New Sale</Link>
        </div>
      </div>

      {/* Profit Row */}
      <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded- border border-white/10 hover:border-emerald-500/30 hover:-translate-y-1 transition-all shadow-2xl">
          <p className="text- text-[#666] uppercase tracking-[0.2em]">Revenue</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">${summary.revenue}</p>
          <p className="text-xs text-[#444] mt-1">{summary.orders_count} orders</p>
        </div>
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded- border border-white/10 hover:border-red-500/30 hover:-translate-y-1 transition-all shadow-2xl">
          <p className="text- text-[#666] uppercase tracking-[0.2em]">COGS + Expenses</p>
          <p className="text-3xl font-bold text-red-400 mt-2">-${(summary.cogs + summary.expenses).toFixed(2)}</p>
          <p className="text-xs text-[#444] mt-1">Batches ${summary.cogs} + Exp ${summary.expenses}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1A1500] to-[#0A0A0A] p-6 rounded- border border-[#C9A86A]/30 shadow-[0_0_30px_rgba(201,168,106,0.15)] hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A86A]/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
          <p className="text- text-[#C9A86A]/60 uppercase tracking-[0.2em]">Net Profit</p>
          <p className="text-3xl font-bold text-white mt-2">${summary.net_profit}</p>
          <p className="text-xs text-[#C9A86A] mt-1">{summary.revenue>0? ((summary.net_profit/summary.revenue)*100).toFixed(1):0}% margin</p>
        </div>
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded- border border-white/10 hover:border-[#C9A86A]/30 hover:-translate-y-1 transition-all shadow-2xl">
          <p className="text- text-[#666] uppercase tracking-[0.2em]">Franchise Ready</p>
          <p className="text-3xl font-bold text-white mt-2">{summary.franchise_percent}%</p>
          <p className="text-xs text-[#444] mt-1">{summary.franchise_completed}/{summary.franchise_total} tasks</p>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-3"><div className="bg-[#C9A86A] h-1.5 rounded-full shadow-[0_0_10px_#C9A86A]" style={{width:`${summary.franchise_percent}%`}}></div></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        <div className="col-span-2 space-y-6">
          {/* Low Stock - FIXED ALIGNMENT */}
          <div className="bg-[#111]/60 backdrop-blur-xl rounded- border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#1A0A0A]">
              <h3 className="font-semibold flex items-center gap-2"><span className="animate-pulse">⚠</span> Low Stock Alerts ({summary.low_stock_count})</h3>
              <Link to="/inventory" className="text-xs text-[#C9A86A] hover:text-white transition-colors">View Inventory →</Link>
            </div>
            {summary.low_stock.length===0? <p className="p-10 text-sm text-[#444] text-center italic">All stock OK — no low stock items ✨</p> : (
              <table className="w-full text-sm">
                <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60">
                  <tr>
                    <th className="p-4 text-left font-normal">Ingredient</th>
                    <th className="p-4 text-center font-normal">Stock</th>
                    <th className="p-4 text-center font-normal">Reorder Point</th>
                    <th className="p-4 text-center font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.low_stock.map((i:any)=>
                    <tr key={i.id} className="border-t border-white/5 hover:bg-white/[0.03] hover:border-l-2 hover:border-l-[#C9A86A] transition-all group">
                      <td className="p-4 font-medium text-left text-white group-hover:text-[#C9A86A]">{i.name}</td>
                      <td className="p-4 text-center font-mono text-red-400 font-bold">{i.stock}</td>
                      <td className="p-4 text-center font-mono text-[#666]">{i.reorder}</td>
                      <td className="p-4 text-center"><span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text- shadow-[0_0_10px_rgba(239,68,68,0.2)]"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>LOW</span></td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* COGS */}
          <div className="bg-[#111]/60 backdrop-blur-xl rounded- border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold">COGS Analysis — Cost per Bowl</h3>
              <Link to="/production" className="text-xs text-[#666] hover:text-white">View Batches →</Link>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#666]"><tr><th className="p-4 text-left">Product</th><th className="p-4 text-center">Cost/tub</th><th className="p-4 text-center">Batch Size</th><th className="p-4 text-center">Total Cost</th></tr></thead>
              <tbody>
                {Array.isArray(cogs) && cogs.length>0? cogs.slice(0,5).map((c:any, idx:number)=><tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02]"><td className="p-4 text-left text-white/80">{c.product_name||c.name||'--'}</td><td className="p-4 text-center font-mono text-[#C9A86A] font-bold">${c.cost_per_unit?.toFixed(2)||c.cost_per_tub?.toFixed(2)||'0.00'}</td><td className="p-4 text-center"><span className="px-2 py-1 bg-white/5 rounded-full text-xs">{c.batch_size||c.quantity||'--'}</span></td><td className="p-4 text-center font-mono">${c.total_cost?.toFixed(2)||'--'}</td></tr>) : <tr><td colSpan={4} className="p-10 text-center text-[#444] border border-dashed border-white/10 m-4 rounded-xl">No batch data yet — create in Production ✨</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111]/60 backdrop-blur-xl rounded- border border-white/10 p-6 shadow-2xl">
            <h3 className="font-serif italic text-lg mb-5">Business Stats</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-white/5"><span className="text-[#666] text- uppercase tracking-widest">Products</span><span className="font-mono text-xl font-bold">{summary.products_count}</span></div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5"><span className="text-[#666] text- uppercase tracking-widest">Batches Produced</span><span className="font-mono text-xl font-bold">{summary.batches_count}</span></div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5"><span className="text-[#666] text- uppercase tracking-widest">Team Members</span><span className="font-mono text-xl font-bold">{summary.staff_count}</span></div>
              <div className="flex justify-between items-center"><span className="text-[#666] text- uppercase tracking-widest">Total Orders</span><span className="font-mono text-xl font-bold">{summary.orders_count}</span></div>
            </div>
          </div>

          <div className="bg-[#111]/60 backdrop-blur-xl rounded- border border-white/10 p-6">
            <h3 className="font-serif italic text-lg mb-4 flex items-center gap-2">🏆 Top Sellers</h3>
            {sales?.top_products?.length? sales.top_products.map((p:any, i:number)=><div key={i} className="flex justify-between text-sm py-2.5 border-b border-white/5 last:border-0"><span className="flex gap-2"><span className={i===0?'text-[#C9A86A]':i===1?'text-gray-400':'text-amber-700'}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>{p.name}</span><span className="font-mono font-bold">{p.qty}</span></div>) : <p className="text-xs text-[#444] italic">No sales yet — start selling ✨</p>}
          </div>

          <div className="bg-[#111]/60 backdrop-blur-xl rounded- border border-white/10 p-6">
            <h3 className="font-serif italic text-lg mb-4">Recent Batches</h3>
            {batches.slice(0,4).map((b:any)=><div key={b.id} className="flex justify-between text-sm py-2.5 border-b border-white/5 last:border-0"><span className="font-mono text-xs text-white/60">{b.batch_number||b.id.substring(0,8)}</span><span className={`px-2.5 py-1 rounded-full text- uppercase tracking-widest ${b.status==='completed'?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]':'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>{b.status}</span></div>)}
            {batches.length===0 && <p className="text-xs text-[#444] italic">No batches</p>}
          </div>

          <div className="bg-gradient-to-br from-[#C9A86A]/20 to-[#C9A86A]/5 border border-[#C9A86A]/20 rounded- p-5 backdrop-blur-xl">
            <p className="text- font-bold tracking-[0.2em] uppercase text-[#C9A86A]">Final Phase 12 ✅</p>
            <p className="text-sm text-white font-bold mt-2">Built by [Ariel.A] - Phase 12.1 Verifying Everything Syncs</p>
            <button onClick={() => alert('I BUILT THIS MYSELF 🔥')} className="mt-4 w-full px-4 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-[#111] border border-white/10 hover:border-[#C9A86A]/50 transition-all">CLICK ME ✨</button>
          </div>
        </div>
      </div>
    </div>
  )
}