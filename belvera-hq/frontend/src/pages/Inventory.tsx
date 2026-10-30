import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Inventory() {
  const [items, setItems] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [showAdjust, setShowAdjust] = useState<any>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<any>({name:'', sku:'', unit:'kg', category:'ingredient', stock_quantity:0, cost_per_unit:0, sell_price:0, is_sellable:true, reorder_point:5, location:'', supplier:''})
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    const [inv, ing] = await Promise.all([
      axios.get(`${API}/inventory`).catch(()=>({data:[]})),
      axios.get(`${API}/ingredients`).catch(()=>({data:[]}))
    ])
    setItems(inv.data); setIngredients(ing.data)
  }
  useEffect(()=>{load()},[])

  const allStock = [...ingredients.map((i:any)=>({...i, _type:'ingredient'})),...items.map((i:any)=>({...i, _type:'inventory'}))]
  const filtered = allStock.filter((it:any)=>{
    if(filter!=='all' && (it.category||it._type)!==filter && it._type!==filter) return false
    if(search &&!it.name?.toLowerCase().includes(search.toLowerCase()) &&!it.sku?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const totalValue = allStock.reduce((s:any,i:any)=>(s + (i.stock_quantity||i.quantity||0)*(i.cost_per_unit||0)),0)
  const lowStock = allStock.filter((i:any)=>(i.stock_quantity||i.quantity||0) <= (i.reorder_point||5))

  const doAdjust = async () => {
    const isIng = showAdjust._type === 'ingredient'
    const endpoint = isIng? `${API}/ingredients/${showAdjust.id}/adjust` : `${API}/inventory/${showAdjust.id}/adjust`
    await axios.post(endpoint, {quantity: adjustQty})
    setShowAdjust(null); setAdjustQty(0); load()
  }
  const deleteItem = async (id:string, type:string) => {
    const t = prompt(`ADMIN DELETE - Founder only: Type DELETE to delete this ${type}`)
    if(t!=='DELETE') return alert('Cancelled')
    if(type==='ingredient') await axios.delete(`${API}/ingredients/${id}`)
    else await axios.delete(`${API}/inventory/${id}`)
    load()
  }
  const openEdit = (item:any) => {
    setShowEdit(item)
    setEditForm({name:item.name, sku:item.sku||'', unit:item.unit||'kg', category:item.category||item._type||'ingredient', stock_quantity:item.stock_quantity?? item.quantity?? 0, cost_per_unit:item.cost_per_unit||0, sell_price:item.sell_price||0, is_sellable:item.is_sellable||false, reorder_point:item.reorder_point||5, location:item.location||'', supplier:item.supplier||''})
  }
  const saveEdit = async () => {
    const isIng = showEdit._type === 'ingredient' || editForm.category === 'ingredient'
    const endpoint = isIng? `${API}/ingredients/${showEdit.id}` : `${API}/inventory/${showEdit.id}`
    await axios.put(endpoint, {...editForm, quantity: editForm.stock_quantity})
    setShowEdit(null); load()
  }
  const createItem = async () => {
    if(!addForm.name) return alert('Name required')
    const endpoint = addForm.category === 'ingredient'? `${API}/ingredients` : `${API}/inventory`
    await axios.post(endpoint, {...addForm, sell_price: addForm.sell_price || addForm.cost_per_unit})
    setShowAdd(false); setAddForm({name:'', sku:'', unit:'kg', category:'ingredient', stock_quantity:0, cost_per_unit:0, sell_price:0, is_sellable:true, reorder_point:5, location:'', supplier:''}); load()
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.08] blur- rounded-full pointer-events-none"></div>
      <div className="absolute top-20 right-[-50px] w- h- bg-red-600 opacity-[0.06] blur- rounded-full pointer-events-none"></div>

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}>
            <span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Inventory</span>
          </h1>
          <p className="text-[#666] text-sm mt-2 tracking-widest uppercase">Total Stock Value: <span className="text-white font-bold">${totalValue.toFixed(2)}</span> • {allStock.length} items • {lowStock.length} low stock • LINKED TO POS</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="px-6 py-3 bg-[#C9A86A] text-black rounded-full text-sm font-bold hover:bg-[#D8B87A] shadow-[0_0_20px_rgba(201,168,106,0.3)] transition-all">+ Add Anything → POS</button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all shadow-2xl">
          <p className="text- text-[#666] uppercase tracking-[0.2em]">Total Items</p>
          <p className="text-3xl font-bold mt-2">{allStock.length}</p>
          <p className="text-xs text-[#444] mt-1">ingredients + inventory</p>
        </div>
        <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-emerald-500/30 hover:-translate-y-1 transition-all shadow-2xl">
          <p className="text- text-[#666] uppercase tracking-[0.2em]">Total Value</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">${totalValue.toFixed(2)}</p>
          <p className="text-xs text-[#444] mt-1">real cost × stock</p>
        </div>
        <div className={`backdrop-blur-xl p-6 rounded-2xl border shadow-2xl hover:-translate-y-1 transition-all ${lowStock.length>0?'bg-red-950/30 border-red-500/30':'bg-[#111]/60 border-white/10'}`}>
          <p className="text- uppercase tracking-[0.2em] text-[#666]">Low Stock Alert</p>
          <p className={`text-3xl font-bold mt-2 ${lowStock.length>0?'text-red-400':'text-white'}`}>{lowStock.length}</p>
          <p className="text-xs text-[#666] mt-1 truncate">{lowStock.length>0? `AI: Order ${lowStock.map((l:any)=>l.name).slice(0,2).join(', ')}` : 'All stocked ✨'}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1A1500] to-[#0A0A0A] p-6 rounded-2xl border border-[#C9A86A]/30 shadow-[0_0_30px_rgba(201,168,106,0.15)] hover:-translate-y-1 transition-all">
          <p className="text- text-[#C9A86A]/60 uppercase tracking-[0.2em]">AI Insight</p>
          <p className="text-xs mt-3 leading-relaxed text-white/70">CHECK <span className="text-[#C9A86A] font-bold">"Show in POS"</span> to make it appear in Orders with real price + TPS/TVQ auto</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-[#111]/60 backdrop-blur-xl rounded-full border border-white/10 p-2 mb-6 flex gap-2 relative z-10">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or SKU..." className="flex-1 px-5 py-2.5 rounded-full bg-[#0A0A0A] border border-white/5 focus:border-[#C9A86A]/50 outline-none text-sm text-white placeholder:text-[#444]"/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white">
          <option value="all">All Categories</option>
          <option value="ingredient">Ingredients</option>
          <option value="packaging">Packaging</option>
          <option value="inventory">Custom / Other</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/50">
          <h3 className="font-semibold">All Stock — Linked to POS ({filtered.length})</h3>
          <span className="text- bg-[#C9A86A] text-black px-3 py-1 rounded-full font-bold uppercase tracking-widest">Cost + Sell Price + POS Toggle</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left font-normal">Name</th><th className="p-4 font-normal">Type</th><th className="p-4 font-normal">SKU</th><th className="p-4 font-normal">Stock</th><th className="p-4 font-normal">Cost</th><th className="p-4 font-normal">Sell $</th><th className="p-4 font-normal">POS?</th><th className="p-4 font-normal">Action</th></tr></thead>
          <tbody>
            {filtered.map((it:any)=>(
              <tr key={it.id+it._type} className="border-t border-white/5 hover:bg-white/[0.03] hover:border-l-2 hover:border-l-[#C9A86A] transition-all group">
                <td className="p-4"><p className="font-medium text-white group-hover:text-[#C9A86A]">{it.name} <span className="text-xs text-[#666]">{it.unit||''}</span></p><p className="text-xs text-[#444]">{it.location||''} {it.supplier?`• ${it.supplier}`:''}</p></td>
                <td className="text-center"><span className={`px-2.5 py-1 rounded-full text- uppercase tracking-widest border ${it._type==='ingredient'?'bg-green-500/10 text-green-400 border-green-500/20':'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>{it.category||it._type}</span></td>
                <td className="text-center font-mono text-xs text-[#666]">{it.sku||'--'}</td>
                <td className="text-center font-mono font-bold">{it.stock_quantity?? it.quantity?? 0}</td>
                <td className="text-center text-[#666]">${it.cost_per_unit||0}</td>
                <td className="text-center font-bold text-[#C9A86A]">${it.sell_price||0}</td>
                <td className="text-center">{it.is_sellable? <span className="bg-[#C9A86A] text-black text- px-2.5 py-1 rounded-full font-bold">POS</span> : <span className="text-[#333]">—</span>}</td>
                <td className="text-center"><div className="flex gap-1.5 justify-center"><button onClick={()=>{setShowAdjust(it); setAdjustQty(0)}} className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-[#C9A86A] transition">Adjust</button><button onClick={()=>openEdit(it)} className="text-xs border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10">Edit</button><button onClick={()=>deleteItem(it.id,it._type)} className="text-xs text-red-400 hover:text-red-300 px-2">✕</button></div></td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={8} className="p-16 text-center text-[#444] italic border border-dashed border-white/10 m-4 rounded-xl">No items — click + Add Anything ✨</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="w- bg-[#111] border border-white/10 rounded- p-6 shadow-2xl max-h- overflow-auto">
            <h3 className="font-serif italic text-xl font-bold">Add Anything — LINKED TO POS</h3>
            <p className="text- text-[#666] mb-4 mt-1 tracking-wide">Cost = what you pay. Sell = what customer pays. Check Show in POS</p>
            <div className="flex flex-col gap-3">
              <input value={addForm.name} onChange={e=>setAddForm({...addForm, name:e.target.value})} placeholder="Name — Blue Spirulina, Bowl 16oz" className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none"/>
              <div className="grid grid-cols-2 gap-3">
                <select value={addForm.category} onChange={e=>setAddForm({...addForm, category:e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"><option value="ingredient">Ingredient</option><option value="packaging">Packaging</option><option value="custom">Custom / Other</option></select>
                <input value={addForm.unit} onChange={e=>setAddForm({...addForm, unit:e.target.value})} placeholder="kg, g, L, pc" className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text- uppercase tracking-widest text-[#666]">Cost $</label><input type="number" value={addForm.cost_per_unit} onChange={e=>setAddForm({...addForm, cost_per_unit:Number(e.target.value)})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1 text-white"/></div>
                <div><label className="text- uppercase tracking-widest text-[#C9A86A]">Sell Price $</label><input type="number" value={addForm.sell_price} onChange={e=>setAddForm({...addForm, sell_price:Number(e.target.value)})} placeholder="1.00" className="w-full px-4 py-3 bg-[#C9A86A]/10 border border-[#C9A86A]/30 rounded-full text-sm mt-1 text-white focus:border-[#C9A86A] outline-none"/></div>
              </div>
              <label className="flex gap-3 items-center bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-full text-sm cursor-pointer"><input type="checkbox" checked={addForm.is_sellable} onChange={e=>setAddForm({...addForm, is_sellable:e.target.checked})} className="accent-[#C9A86A]"/><span className="font-bold text-xs text-emerald-300">Show in POS / Orders? ✅</span></label>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text- uppercase tracking-widest text-[#666]">Stock Qty</label><input type="number" value={addForm.stock_quantity} onChange={e=>setAddForm({...addForm, stock_quantity:Number(e.target.value)})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1 text-white"/></div>
                <div><label className="text- uppercase tracking-widest text-[#666]">Reorder Alert</label><input type="number" value={addForm.reorder_point} onChange={e=>setAddForm({...addForm, reorder_point:Number(e.target.value)})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1 text-white"/></div>
              </div>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>setShowAdd(false)} className="flex-1 border border-white/10 px-4 py-3 rounded-full text-sm font-bold hover:bg-white/5">Cancel</button><button onClick={createItem} className="flex-1 bg-[#C9A86A] text-black px-4 py-3 rounded-full text-sm font-bold hover:bg-[#D8B87A] shadow-[0_0_20px_rgba(201,168,106,0.3)]">Add Item → POS</button></div>
          </div>
        </div>
      )}

      {showAdjust && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="w- bg-[#111] border border-white/10 rounded- p-6 shadow-2xl">
            <h3 className="font-bold">Adjust — <span className="text-[#C9A86A]">{showAdjust.name}</span></h3>
            <input type="number" value={adjustQty} onChange={e=>setAdjustQty(Number(e.target.value))} placeholder="+10 / -5" className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full mt-4 text-sm text-white focus:border-[#C9A86A]/50 outline-none"/>
            <div className="flex gap-2 mt-4"><button onClick={()=>setShowAdjust(null)} className="flex-1 border border-white/10 px-4 py-3 rounded-full text-sm">Cancel</button><button onClick={doAdjust} className="flex-1 bg-white text-black px-4 py-3 rounded-full text-sm font-bold">Save</button></div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="w- bg-[#111] border border-white/10 rounded- p-6 shadow-2xl max-h- overflow-auto">
            <h3 className="font-serif italic text-xl font-bold mb-4">Edit Item — Linked to POS</h3>
            <div className="flex flex-col gap-3">
              <input value={editForm.name||''} onChange={e=>setEditForm({...editForm, name:e.target.value})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text- uppercase text-[#666]">Cost $</label><input type="number" value={editForm.cost_per_unit||0} onChange={e=>setEditForm({...editForm, cost_per_unit:Number(e.target.value)})} className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm mt-1 text-white"/></div>
                <div><label className="text- uppercase text-[#C9A86A]">Sell $</label><input type="number" value={editForm.sell_price||0} onChange={e=>setEditForm({...editForm, sell_price:Number(e.target.value)})} className="w-full px-4 py-3 bg-[#C9A86A]/10 border border-[#C9A86A]/30 rounded-full text-sm mt-1 text-white"/></div>
              </div>
              <label className="flex gap-2 items-center text-sm text-white/70"><input type="checkbox" checked={editForm.is_sellable||false} onChange={e=>setEditForm({...editForm, is_sellable:e.target.checked})} className="accent-[#C9A86A]"/> Show in POS</label>
              <input type="number" value={editForm.stock_quantity||0} onChange={e=>setEditForm({...editForm, stock_quantity:Number(e.target.value)})} placeholder="Stock Qty" className="px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>setShowEdit(null)} className="flex-1 border border-white/10 px-4 py-3 rounded-full text-sm">Cancel</button><button onClick={saveEdit} className="flex-1 bg-[#C9A86A] text-black px-4 py-3 rounded-full text-sm font-bold">Save → POS Updates</button></div>
          </div>
        </div>
      )}
    </div>
  )
}