import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Team() {
  const [staff, setStaff] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<any>({name:'', role:'staff', wage_per_hour:18, status:'active'})
  const [editMode, setEditMode] = useState<any>(null)
  const [view, setView] = useState<'grid'|'table'>('grid')

  const load = async () => {
    try {
      const [s, st] = await Promise.all([
        axios.get(`${API}/staff`),
        axios.get(`${API}/staff/stats`).catch(()=>({data:null}))
      ])
      setStaff(s.data); setStats(st.data)
    } catch(e){ console.log(e) }
  }
  useEffect(()=>{load()},[])

  const save = async () => {
    if(!form.name){ alert("Name required"); return }
    const payload = {...form, pay_rate: form.wage_per_hour, wage_per_hour: form.wage_per_hour, is_active: form.status === 'active' }
    if(editMode) await axios.put(`${API}/staff/${editMode.id}`, payload)
    else await axios.post(`${API}/staff`, payload)
    setShowNew(false); setForm({name:'', role:'staff', wage_per_hour:18, status:'active'}); setEditMode(null); load()
  }

  const deleteStaff = async (id:string) => {
    const t = prompt('ADMIN DELETE: Type DELETE to remove staff')
    if(t!=='DELETE') return
    await axios.delete(`${API}/staff/${id}`); load()
  }

  const clock = async (s:any) => {
    const action = (s.status === 'active' || s.is_active)? 'out' : 'in'
    await axios.post(`${API}/staff/${s.id}/clock`, {action}); load()
  }

  const openEdit = (s:any) => {
    setEditMode({id:s.id});
    setForm({ name:s.name, role:s.role||'staff', wage_per_hour:s.wage_per_hour || s.pay_rate || 18, email:s.email||'', phone:s.phone||'', status: s.status || (s.is_active? 'active' : 'off_duty') });
    setShowNew(true)
  }

  const roleColor = (role:string) => {
    if(role==='founder') return 'bg-[#C9A86A] text-black border border-[#C9A86A]'
    if(role==='manager') return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    if(role==='production') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    if(role==='pos') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    return 'bg-white/5 text-white/60 border border-white/10'
  }

  const aiTip = (s:any) => {
    const role = s.role||'staff'
    const active = s.status==='active' || s.is_active
    if(!active) return '⚪ Off duty'
    if(role==='founder') return '🔥 AI: Founder - full access'
    if(role==='manager') return '✅ AI: Can approve batches'
    if(role==='production') return '💡 AI: Assign 20 tub batch'
    return '⚡ AI: Ready for shift'
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Team & Staff</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">{stats? stats.ai_summary : 'Manage team, wages, roles'} • {staff.length} members</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-full p-1">
            <button onClick={()=>setView('grid')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${view==='grid'?'bg-white text-black shadow':'text-[#666]'}`}>Grid</button>
            <button onClick={()=>setView('table')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${view==='table'?'bg-white text-black shadow':'text-[#666]'}`}>Table</button>
          </div>
          <button onClick={()=>{setEditMode(null); setForm({name:'', role:'staff', wage_per_hour:18, status:'active'}); setShowNew(true)}} className="px-6 py-2.5 bg-[#C9A86A] text-black rounded-full text-sm font-bold shadow-[0_0_20px_rgba(201,168,106,0.3)]">+ Add Staff</button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
          <div className="bg-[#111]/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10"><p className="text- text-[#666] uppercase tracking-widest">Total Team</p><p className="text-3xl font-bold mt-2">{stats.total}</p></div>
          <div className="bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-xl p-5 rounded-2xl"><p className="text- text-emerald-400/60 uppercase tracking-widest">Active Today</p><p className="text-3xl font-bold text-emerald-400 mt-2">{stats.active_today}</p></div>
          <div className="bg-[#111]/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10"><p className="text- text-[#666] uppercase tracking-widest">Roles</p><p className="text-xs font-bold mt-2 text-white/70">{Object.entries(stats.roles||{}).map(([k,v]:any)=>`${k}:${v}`).join(' • ')||'--'}</p></div>
          <div className="bg-gradient-to-br from-[#1A1500] to-black p-5 rounded-2xl border border-[#C9A86A]/20"><p className="text- text-[#C9A86A]/60 uppercase tracking-widest">AI Insight</p><p className="text-xs mt-2 text-white/60">{stats.ai_summary}</p></div>
        </div>
      )}

      {view==='grid'? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
          {staff.map((s:any)=>(
            <div key={s.id} className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-[#C9A86A]/20 hover:-translate-y-1 transition-all shadow-xl group">
              <div className="flex justify-between items-start">
                <div className="relative">
                  <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name||'S')}&background=111&color=C9A86A`} className="w-12 h-12 rounded-full border border-white/10" />
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111] ${(s.status==='active'||s.is_active)?'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]':'bg-[#333]'}`}></span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text- font-bold uppercase tracking-widest ${roleColor(s.role)}`}>{s.role||'staff'}</span>
              </div>
              <h3 className="font-bold mt-4 group-hover:text-[#C9A86A] transition">{s.name}</h3>
              <p className="text-xs text-[#666]">{s.email||s.phone||'No contact'}</p>
              <p className="text-xs mt-2 text-[#C9A86A] font-mono">${s.wage_per_hour||s.pay_rate||0}/hr</p>
              <div className="mt-3 p-2.5 bg-[#0A0A0A] border border-white/5 rounded-xl text- text-[#888]">{aiTip(s)}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=>clock(s)} className={`flex-1 text- py-2 rounded-full font-bold transition ${(s.status==='active'||s.is_active)?'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20':'bg-[#C9A86A] text-black'}`}>{(s.status==='active'||s.is_active)?'Clock Out':'Clock In'}</button>
                <button onClick={()=>openEdit(s)} className="flex-1 text- border border-white/10 py-2 rounded-full hover:bg-white/10">Edit</button>
                <button onClick={()=>deleteStaff(s.id)} className="text- text-red-400/60 hover:text-red-400 px-2">✕</button>
              </div>
            </div>
          ))}
          {staff.length===0 && <div className="col-span-4 p-16 text-center text-[#444] italic bg-[#111]/40 border border-dashed border-white/10 rounded-2xl">No staff yet — add founder first ✨</div>}
        </div>
      ) : (
        <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
          <table className="w-full text-sm">
            <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left">Member</th><th>Role</th><th>Wage</th><th>Contact</th><th>Status</th><th>AI</th><th>Action</th></tr></thead>
            <tbody>
              {staff.map((s:any)=>(
                <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="p-4 flex items-center gap-3"><img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name||'S')}&background=111&color=C9A86A`} className="w-8 h-8 rounded-full border border-white/10" /><span className="font-semibold">{s.name}</span></td>
                  <td><span className={`px-2.5 py-1 rounded-full text- ${roleColor(s.role)}`}>{s.role}</span></td>
                  <td className="text-[#C9A86A] font-mono">${s.wage_per_hour||s.pay_rate||0}/hr</td>
                  <td className="text-xs text-[#666]">{s.email||s.phone||'--'}</td>
                  <td><span className={`text- px-2.5 py-1 rounded-full border ${(s.status==='active'||s.is_active)?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-white/5 text-[#666] border-white/10'}`}>{(s.status==='active'||s.is_active)?'● Active':'○ Off'}</span></td>
                  <td className="text- text-[#666]">{aiTip(s)}</td>
                  <td className="space-x-1"><button onClick={()=>clock(s)} className="text- border border-white/10 px-3 py-1 rounded-full">{(s.status==='active'||s.is_active)?'Out':'In'}</button><button onClick={()=>openEdit(s)} className="text- border border-white/10 px-3 py-1 rounded-full">Edit</button><button onClick={()=>deleteStaff(s.id)} className="text- text-red-400/60">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w- shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold">{editMode? 'Edit Staff' : 'Add Staff Member'}</h3>
            <div className="space-y-3 mt-5">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Full Name *" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none"/>
              <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white">
                <option value="founder">Founder (Admin)</option><option value="manager">Manager</option><option value="production">Production</option><option value="pos">POS / Sales</option><option value="staff">Staff - General</option><option value="trainee">Trainee</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.wage_per_hour} onChange={e=>setForm({...form, wage_per_hour:Number(e.target.value)})} placeholder="Wage/hr" className="p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
                <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"><option value="active">Active Today</option><option value="off_duty">Off Duty</option><option value="inactive">Inactive</option></select>
              </div>
              <input value={form.phone||''} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              <input value={form.email||''} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>{setShowNew(false); setEditMode(null)}} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={save} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">{editMode?'Save':'Add'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}