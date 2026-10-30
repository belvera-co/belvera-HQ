import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [packaging, setPackaging] = useState<any[]>([])
  const [showSupplier, setShowSupplier] = useState(false)
  const [showIngredient, setShowIngredient] = useState(false)
  const [showPackaging, setShowPackaging] = useState(false)
  const [supForm, setSupForm] = useState<any>({name:'', category:'', email:'', contact_name:'', phone:''})
  const [ingForm, setIngForm] = useState<any>({name:'', category:'', cost_per_unit:0, stock_quantity:0, unit:'kg', sku:'', reorder_point:0})
  const [packForm, setPackForm] = useState<any>({name:'', cost_per_unit:0, stock_quantity:0, unit:'pcs', sku:''})
  const [editMode, setEditMode] = useState<any>(null)

  const load = async () => {
    const [s,i,p] = await Promise.all([
      axios.get(`${API}/suppliers`),
      axios.get(`${API}/ingredients`),
      axios.get(`${API}/packaging`)
    ])
    setSuppliers(s.data); setIngredients(i.data); setPackaging(p.data)
  }
  useEffect(()=>{load()},[])

  const createSupplier = async () => {
    if(!supForm.name) return alert('Name required')
    if(editMode?.type==='supplier'){
      await axios.put(`${API}/suppliers/${editMode.id}`, supForm)
    } else {
      await axios.post(`${API}/suppliers`, supForm)
    }
    setShowSupplier(false); setSupForm({name:'', category:'', email:'', contact_name:'', phone:''}); setEditMode(null); load()
  }

  const createIngredient = async () => {
    if(!ingForm.name) return alert('Name required - type anything: Beef, Pistachio, Screws, etc')
    if(editMode?.type==='ingredient'){
      await axios.put(`${API}/ingredients/${editMode.id}`, ingForm)
    } else {
      await axios.post(`${API}/ingredients`, ingForm)
    }
    setShowIngredient(false); setIngForm({name:'', category:'', cost_per_unit:0, stock_quantity:0, unit:'kg', sku:'', reorder_point:0}); setEditMode(null); load()
  }

  const createPackaging = async () => {
    if(!packForm.name) return alert('Name required')
    if(editMode?.type==='packaging'){
      await axios.put(`${API}/packaging/${editMode.id}`, packForm)
    } else {
      await axios.post(`${API}/packaging`, packForm)
    }
    setShowPackaging(false); setPackForm({name:'', cost_per_unit:0, stock_quantity:0, unit:'pcs', sku:''}); setEditMode(null); load()
  }

  const deleteItem = async (id:string, type:string) => {
    const t = prompt(`ADMIN DELETE - Type DELETE to delete this ${type}`)
    if(t!=='DELETE') return
    await axios.delete(`${API}/${type==='supplier'?'suppliers': type==='ingredient'?'ingredients':'packaging'}/${id}`)
    load()
  }

  const openEditSupplier = (s:any) => {
    setEditMode({type:'supplier', id:s.id})
    setSupForm({name:s.name, category:s.category||'', email:s.email||'', contact_name:s.contact_name||'', phone:s.phone||''})
    setShowSupplier(true)
  }
  const openEditIngredient = (ing:any) => {
    setEditMode({type:'ingredient', id:ing.id})
    setIngForm({name:ing.name, category:ing.category||'', cost_per_unit:ing.cost_per_unit, stock_quantity:ing.stock_quantity, unit:ing.unit||'kg', sku:ing.sku||'', reorder_point:ing.reorder_point||0})
    setShowIngredient(true)
  }
  const openEditPackaging = (p:any) => {
    setEditMode({type:'packaging', id:p.id})
    setPackForm({name:p.name||p.type, cost_per_unit:p.cost_per_unit||0, stock_quantity:p.stock_quantity||0, unit:p.unit||'pcs', sku:p.sku||''})
    setShowPackaging(true)
  }

  const unitChips = ['g','kg','ml','L','pcs','box','bucket','pack']

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-100px] w- h- bg-white/5 blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Suppliers & Inventory</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">100% customizable — any company • {suppliers.length} suppliers • Luxury</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{setEditMode(null); setShowSupplier(true)}} className="px-5 py-2.5 bg-[#C9A86A] text-black rounded-full text-sm font-bold shadow-[0_0_20px_rgba(201,168,106,0.3)] hover:bg-[#D8B87A]">+ Supplier</button>
          <button onClick={()=>{setEditMode(null); setShowIngredient(true)}} className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold">+ Any Item</button>
          <button onClick={()=>{setEditMode(null); setShowPackaging(true)}} className="px-5 py-2.5 bg-white/10 border border-white/10 text-white rounded-full text-sm">+ Packaging</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 flex justify-between bg-[#0A0A0A]/50"><h3 className="font-bold text-xs uppercase tracking-widest">Suppliers ({suppliers.length})</h3><span className="text- bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">Free-type</span></div>
          <div className="divide-y divide-white/5 max-h- overflow-auto">
            {suppliers.length===0 && <p className="p-10 text-sm text-[#444] italic text-center">No suppliers yet — click + Supplier and type any name</p>}
            {suppliers.map((s:any)=>(
              <div key={s.id} className="p-4 flex justify-between hover:bg-white/[0.03] transition group">
                <div><p className="font-bold group-hover:text-[#C9A86A] transition">{s.name}</p><p className="text-xs text-[#666]">{s.category||'no category'} • {s.email||'no email'}</p></div>
                <div className="flex gap-1.5 items-center"><button onClick={()=>openEditSupplier(s)} className="text- border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10">Edit</button><button onClick={()=>deleteItem(s.id,'supplier')} className="text- text-red-400/60 hover:text-red-400">✕</button></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/5 flex justify-between bg-[#0A0A0A]/50"><h3 className="font-bold text-xs uppercase tracking-widest">Packaging / Other ({packaging.length})</h3><span className="text- bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">Free-type</span></div>
          <div className="divide-y divide-white/5 max-h- overflow-auto">
            {packaging.length===0 && <p className="p-10 text-sm text-[#444] italic text-center">No packaging — add Bowls, Lids, Spoons, Boxes, etc</p>}
            {packaging.map((p:any)=>(
              <div key={p.id} className="p-4 flex justify-between hover:bg-white/[0.03] group">
                <div><p className="font-bold group-hover:text-[#C9A86A]">{p.name||p.type}</p><p className="text-xs text-[#666]">${p.cost_per_unit||0} / {p.unit||'pcs'} • Stock: {p.stock_quantity||0}</p></div>
                <div className="flex gap-1.5 items-center"><button onClick={()=>openEditPackaging(p)} className="text- border border-white/10 px-3 py-1.5 rounded-full">Edit</button><button onClick={()=>deleteItem(p.id,'packaging')} className="text- text-red-400/60">✕</button></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        <div className="p-5 border-b border-white/5 flex justify-between bg-[#0A0A0A]/50"><h3 className="font-bold text-xs uppercase tracking-widest">All Items / Ingredients ({ingredients.length}) - Type Anything</h3><span className="text- bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A] px-2.5 py-1 rounded-full">For ANY Business</span></div>
        <table className="w-full text-sm">
          <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left">Name (free)</th><th>Category (free)</th><th>Cost</th><th>Stock</th><th>Unit</th><th>SKU</th><th>Action</th></tr></thead>
          <tbody>
            {ingredients.length===0 && <tr><td colSpan={7} className="p-10 text-center text-[#444] italic">No items yet — click + Any Item — Beef, Pistachio, Screws, anything</td></tr>}
            {ingredients.map((ing:any)=>(
              <tr key={ing.id} className="border-t border-white/5 hover:bg-white/[0.03] hover:border-l-2 hover:border-l-[#C9A86A] transition">
                <td className="p-4 font-bold">{ing.name}</td>
                <td><span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs">{ing.category||'--'}</span></td>
                <td className="text-[#888]">${Number(ing.cost_per_unit).toFixed(2)}</td>
                <td className="font-mono font-bold">{ing.stock_quantity}</td>
                <td className="text-[#666]">{ing.unit||'kg'}</td>
                <td className="font-mono text-xs text-[#444]">{ing.sku||'--'}</td>
                <td><button onClick={()=>openEditIngredient(ing)} className="text- border border-white/10 px-3 py-1 rounded-full hover:bg-white/10 mr-1">Edit</button><button onClick={()=>deleteItem(ing.id,'ingredient')} className="text- text-red-400/60 hover:text-red-400 font-bold">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSupplier && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold">{editMode?.type==='supplier'? 'Edit Supplier' : 'Add Supplier - Type Anything'}</h3>
            <p className="text-xs text-[#666] mb-4 mt-1">Example: Any supplier name, any category</p>
            <div className="space-y-3">
              <input value={supForm.name} onChange={e=>setSupForm({...supForm, name:e.target.value})} placeholder="Supplier Name * (ex: Sysco, Home Depot, Any)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none"/>
              <input value={supForm.category} onChange={e=>setSupForm({...supForm, category:e.target.value})} placeholder="Category - FREE TYPE" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white" list="supplier-cat-list"/>
              <datalist id="supplier-cat-list"><option value="Food"/><option value="Packaging"/><option value="Meat"/><option value="Produce"/><option value="Hardware"/><option value="Other"/></datalist>
              <input value={supForm.email||''} onChange={e=>setSupForm({...supForm, email:e.target.value})} placeholder="Email (optional)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              <input value={supForm.contact_name||''} onChange={e=>setSupForm({...supForm, contact_name:e.target.value})} placeholder="Contact Name (optional)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>{setShowSupplier(false); setEditMode(null)}} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={createSupplier} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">{editMode?.type==='supplier'?'Save':'Add Supplier'}</button></div>
          </div>
        </div>
      )}

      {showIngredient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w-full max-w-md max-h- overflow-auto shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold">{editMode?.type==='ingredient'? 'Edit Item' : 'Add Any Item - Fully Custom'}</h3>
            <p className="text-xs text-[#666] mb-4 mt-1">Beef Patty, Pistachio, Screw, Shampoo - any company</p>
            <div className="space-y-3">
              <input value={ingForm.name} onChange={e=>setIngForm({...ingForm, name:e.target.value})} placeholder="Item Name * (ex: Beef, Pistachio)" className="w-full p-3.5 bg-black border-2 border-[#C9A86A]/30 rounded-full font-medium text-sm text-white"/>
              <input value={ingForm.category} onChange={e=>setIngForm({...ingForm, category:e.target.value})} placeholder="Category - FREE" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white" list="ing-cat-list"/>
              <datalist id="ing-cat-list"><option value="Fruit"/><option value="Meat"/><option value="Vegetable"/><option value="Packaging"/><option value="Hardware"/><option value="Cleaning"/><option value="Other"/></datalist>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text- uppercase tracking-widest text-[#666]">Cost</label><div className="relative mt-1"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#C9A86A]">$</span><input value={ingForm.cost_per_unit} onChange={e=>setIngForm({...ingForm, cost_per_unit:Number(e.target.value)})} type="number" step="0.01" className="w-full p-3.5 pl-8 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/></div></div>
                <div><label className="text- uppercase tracking-widest text-[#666]">Stock Qty</label><input value={ingForm.stock_quantity} onChange={e=>setIngForm({...ingForm, stock_quantity:Number(e.target.value)})} type="number" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white mt-1"/></div>
              </div>
              <div><label className="text- uppercase tracking-widest text-[#666]">Unit - type or pick</label><input value={ingForm.unit} onChange={e=>setIngForm({...ingForm, unit:e.target.value})} placeholder="kg, pcs, box, etc" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white mb-2 mt-1"/><div className="flex flex-wrap gap-1.5">{unitChips.map(u=>(<button key={u} onClick={()=>setIngForm({...ingForm, unit:u})} className={`text- px-3 py-1 rounded-full border transition ${ingForm.unit===u?'bg-[#C9A86A] text-black border-[#C9A86A]':'bg-white/5 border-white/10 text-[#888] hover:text-white'}`}>{u}</button>))}</div></div>
              <input value={ingForm.sku||''} onChange={e=>setIngForm({...ingForm, sku:e.target.value})} placeholder="SKU / Code (optional)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>{setShowIngredient(false); setEditMode(null)}} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={createIngredient} className="flex-1 bg-white text-black py-3 rounded-full font-bold text-sm">{editMode?.type==='ingredient'?'Save':'Add Item'}</button></div>
          </div>
        </div>
      )}

      {showPackaging && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold">{editMode?.type==='packaging'? 'Edit Packaging' : 'Add Packaging - Type Anything'}</h3>
            <div className="space-y-3 mt-4">
              <input value={packForm.name} onChange={e=>setPackForm({...packForm, name:e.target.value})} placeholder="Packaging Name *" className="w-full p-3.5 bg-black border-2 border-white/10 rounded-full text-sm text-white"/>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#C9A86A]">$</span><input value={packForm.cost_per_unit} onChange={e=>setPackForm({...packForm, cost_per_unit:Number(e.target.value)})} type="number" step="0.01" className="w-full p-3.5 pl-8 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/></div>
                <input value={packForm.stock_quantity} onChange={e=>setPackForm({...packForm, stock_quantity:Number(e.target.value)})} type="number" placeholder="Stock" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              </div>
              <input value={packForm.unit} onChange={e=>setPackForm({...packForm, unit:e.target.value})} placeholder="Unit (pcs, box)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>{setShowPackaging(false); setEditMode(null)}} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={createPackaging} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">{editMode?.type==='packaging'?'Save':'Add'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}