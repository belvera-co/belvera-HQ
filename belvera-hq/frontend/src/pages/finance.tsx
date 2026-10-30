import { useEffect, useState } from "react"
const API = "/api/v1"

type Expense = {
  id: string
  name: string
  amount: number
  category: string
  date: string
  notes?: string
  recurring?: boolean
}

const CATS = ["Rent","Labor","Ingredients","Packaging","Utilities","Marketing","Maintenance","Delivery","Other"]

export default function Finance(){
  const [expenses,setExpenses]=useState<Expense[]>([])
  const [form,setForm]=useState<any>({name:"",amount:"",category:"Other",date:new Date().toISOString().slice(0,10),notes:"",recurring:false})
  const [customCat,setCustomCat]=useState(false)
  const [search,setSearch]=useState("")
  const [filterCat,setFilterCat]=useState("All")
  const [editing,setEditing]=useState<string|null>(null)
  const [editForm,setEditForm]=useState<any>({})

  const load=async()=>{
    const r=await fetch(`${API}/expenses`)
    const d=await r.json()
    setExpenses(Array.isArray(d)?d:[])
  }
  useEffect(()=>{load()},[])

  const add=async()=>{
    if(!form.name ||!form.amount) return alert("Name + Amount required")
    await fetch(`${API}/expenses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,amount:parseFloat(form.amount)})})
    setForm({name:"",amount:"",category:"Other",date:new Date().toISOString().slice(0,10),notes:"",recurring:false})
    setCustomCat(false)
    load()
  }

  const del=async(id:string)=>{
    if(!confirm("Delete this expense?")) return
    await fetch(`${API}/expenses/${id}`,{method:"DELETE"})
    load()
  }

  const saveEdit=async(id:string)=>{
    await fetch(`${API}/expenses/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...editForm,amount:parseFloat(editForm.amount)})})
    setEditing(null)
    load()
  }

  const filtered=expenses.filter(e=>{
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || (e.notes||"").toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat==="All" || e.category===filterCat
    return matchSearch && matchCat
  })
  const total=filtered.reduce((s,e)=>s+Number(e.amount||0),0)

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Finance</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">{filtered.length} expenses • Total ${total.toFixed(2)} • Luxury</p>
        </div>
        <div className="text-right">
          <p className="text- text-[#666] uppercase tracking-widest">Total Filtered</p>
          <p className="text-3xl font-black text-[#C9A86A]">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-[#111]/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl mb-6 flex flex-wrap gap-3 items-end relative z-10">
        <div><label className="text- uppercase tracking-widest text-[#666]">Name</label><input className="bg-[#0A0A0A] border border-white/10 rounded-full px-4 py-2.5 w-40 block text-sm mt-1 focus:border-[#C9A86A]/50 outline-none" placeholder="e.g. Rent, Beef" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
        <div><label className="text- uppercase tracking-widest text-[#666]">Amount $</label><input type="number" step="0.01" className="bg-[#0A0A0A] border border-white/10 rounded-full px-4 py-2.5 w-28 block text-sm mt-1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
        <div>
          <label className="text- uppercase tracking-widest text-[#666]">Category</label>
          {!customCat? (
            <select className="bg-[#0A0A0A] border border-white/10 rounded-full px-4 py-2.5 w-36 block text-sm mt-1" value={form.category} onChange={e=>{if(e.target.value==="__custom"){setCustomCat(true); setForm({...form,category:""})} else setForm({...form,category:e.target.value})}}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              <option value="__custom">+ Any Category...</option>
            </select>
          ) : (
            <input className="bg-[#0A0A0A] border border-[#C9A86A]/30 rounded-full px-4 py-2.5 w-36 block text-sm mt-1" placeholder="Type any category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} autoFocus />
          )}
        </div>
        <div><label className="text- uppercase tracking-widest text-[#666]">Date</label><input type="date" className="bg-[#0A0A0A] border border-white/10 rounded-full px-4 py-2.5 block text-sm mt-1" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
        <div><label className="text- uppercase tracking-widest text-[#666]">Notes</label><input className="bg-[#0A0A0A] border border-white/10 rounded-full px-4 py-2.5 w-40 block text-sm mt-1" placeholder="optional" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.recurring} onChange={e=>setForm({...form,recurring:e.target.checked})} /> Recurring</label>
        <button onClick={add} className="bg-[#C9A86A] text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#D8B87A]">+ Add Expense</button>
      </div>

      <div className="flex gap-3 mb-6 relative z-10">
        <input placeholder="Search expenses..." className="bg-[#111]/60 border border-white/10 rounded-full px-5 py-2.5 w-64 text-sm" value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="bg-[#111]/60 border border-white/10 rounded-full px-5 py-2.5 text-sm" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="All">All Categories</option>
          {Array.from(new Set(expenses.map(e=>e.category))).map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        <table className="w-full text-sm">
          <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left">Name</th><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                {editing===e.id? (
                  <>
                    <td className="p-2"><input className="bg-black border border-white/10 rounded-full px-3 py-1 w-full text-sm" value={editForm.name} onChange={ev=>setEditForm({...editForm,name:ev.target.value})} /></td>
                    <td><input className="bg-black border border-white/10 rounded-full px-3 py-1 w-full text-sm" value={editForm.category} onChange={ev=>setEditForm({...editForm,category:ev.target.value})} /></td>
                    <td><input type="number" step="0.01" className="bg-black border border-white/10 rounded-full px-3 py-1 w-20 text-sm" value={editForm.amount} onChange={ev=>setEditForm({...editForm,amount:ev.target.value})} /></td>
                    <td><input type="date" className="bg-black border border-white/10 rounded-full px-3 py-1 text-sm" value={editForm.date?.slice(0,10)} onChange={ev=>setEditForm({...editForm,date:ev.target.value})} /></td>
                    <td><input className="bg-black border border-white/10 rounded-full px-3 py-1 w-full text-sm" value={editForm.notes||""} onChange={ev=>setEditForm({...editForm,notes:ev.target.value})} /></td>
                    <td className="flex gap-2 p-2"><button onClick={()=>saveEdit(e.id)} className="bg-[#C9A86A] text-black px-3 py-1 rounded-full text-xs font-bold">Save</button><button onClick={()=>setEditing(null)} className="border border-white/10 px-3 py-1 rounded-full text-xs">Cancel</button></td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-bold">{e.name} {e.recurring && <span className="text- bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A] px-2 py-0.5 rounded-full ml-2">↻</span>}</td>
                    <td><span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs">{e.category}</span></td>
                    <td className="font-bold text-[#C9A86A]">${Number(e.amount).toFixed(2)}</td>
                    <td className="text-xs text-[#666]">{e.date?.slice(0,10)}</td>
                    <td className="text-xs text-[#666]">{e.notes}</td>
                    <td className="flex gap-2 p-2"><button onClick={()=>{setEditing(e.id); setEditForm({...e})}} className="text-xs border border-white/10 px-3 py-1 rounded-full hover:bg-white/10">Edit</button><button onClick={()=>del(e.id)} className="text-xs text-red-400/60 hover:text-red-400">Delete</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div className="p-16 text-center text-[#444] italic">No expenses — add one above ✨</div>}
      </div>
    </div>
  )
}