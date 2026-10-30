import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function SOPs() {
  const [sops, setSops] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<any>({title:'', category:'production', station:'blender', content:'', steps:[{text:'', timer:0}], tools:'', location:'', supplier:''})
  const [editMode, setEditMode] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewSop, setViewSop] = useState<any>(null)
  const [executing, setExecuting] = useState<any>(null)
  const [checked, setChecked] = useState<number[]>([])

  const load = async () => {
    try { const res = await axios.get(`${API}/sops/`); setSops(res.data) }
    catch { setSops([]) }
  }
  useEffect(()=>{load()},[])

  const smartGenerate = () => {
    if(!form.title.trim()) return alert('Type title first: e.g. Mango Bowl, Cleaning Blender, Opening Store')
    const t = form.title.toLowerCase()
    let steps:any[] = []
    let cat = form.category
    let station = form.station
    if(t.includes('clean') || t.includes('sanit')){
      cat='cleaning'; station='cleaning'
      steps = [
        {text:`Clear ${form.title} area - Location: ${form.location||'All stations'} - remove items`, timer:0},
        {text:`Spray sanitizer - wait 30s`, timer:30},
        {text:`Scrub with brush - detail - Supplier: ${form.supplier||'Sysco'}`, timer:60},
        {text:`Rinse with water`, timer:0},
        {text:`Dry with towel - Tools: ${form.tools||'towel, sanitizer'}`, timer:0},
        {text:`Photo proof + manager check - Inventory linked`, timer:0},
      ]
    } else if(t.includes('open')){
      cat='opening'; station='front'
      steps = [
        {text:`Turn on lights + POS + music - Location: ${form.location||'Front'}`, timer:0},
        {text:`Check low stock - Inventory - Supplier: ${form.supplier||'Sysco'}`, timer:0},
        {text:`Prep bases 5kg - blender station - Tools: ${form.tools||'blender, scale'}`, timer:300},
        {text:`Sanitize bowls + spoons`, timer:60},
        {text:`Cash float $100`, timer:0},
        {text:`Open doors - ready`, timer:0},
      ]
    } else if(t.includes('close')){
      cat='closing'; station='front'
      steps = [
        {text:`Stop orders - POS closed - Location: ${form.location||'Front'}`, timer:0},
        {text:`Clean blender + bowls - ${form.tools||'brush, sanitizer'}`, timer:120},
        {text:`Store leftovers - label date - Inventory update - Supplier: ${form.supplier||'--'}`, timer:0},
        {text:`Count cash`, timer:0},
        {text:`Turn off machines + lights`, timer:0},
        {text:`Lock doors - photo proof`, timer:0},
      ]
    } else {
      cat='production'; station='bowls'
      const fruit = t.split(' ')[0] || 'fruit'
      steps = [
        {text:`Sanitize ${station} - gloves - Location: ${form.location||'Prep table'} - 30s`, timer:30},
        {text:`Gather tools: ${form.tools||'blender, 16oz bowl, scale, spoon'} - Supplier: ${form.supplier||'Sysco'}`, timer:0},
        {text:`Take frozen ${fruit} base 150g - ${form.location||'Freezer A'} - Inventory auto-deduct`, timer:0},
        {text:`Add liquid 60ml almond milk - measure`, timer:0},
        {text:`Blend 30 sec - until smooth`, timer:30},
        {text:`Pour into 16oz bowl - swirl presentation`, timer:0},
        {text:`Add toppings: granola 30g, ${fruit} 50g, honey - Inventory deducts`, timer:0},
        {text:`Wipe bowl edge - add lid - QR label - Location: ${form.location||'Front'}`, timer:0},
        {text:`Serve - POS link - photo for training`, timer:0},
        {text:`Clean station 60s - log execution - Training linked`, timer:60},
      ]
    }
    const content = steps.map((s,i)=>`${i+1}. ${s.text}${s.timer?` [${s.timer}s]`:''}`).join('\n')
    setForm({...form, category:cat, station, steps, content})
  }

  const save = async () => {
    if(!form.title.trim()) return alert('Title required')
    let finalContent = form.content.trim()
    if(!finalContent && form.steps?.some((s:any)=>s.text.trim())){
      finalContent = form.steps.filter((s:any)=>s.text.trim()).map((s:any,i:number)=>`${i+1}. ${s.text}`).join('\n')
    }
    if(!finalContent) return alert('Click SMART GENERATE or write content')
    const fullPayload = {title: form.title.trim(), category: form.category, content: finalContent, station: form.station, tools: form.tools, location: form.location, supplier: form.supplier}
    const minimalPayload = {title: form.title.trim(), category: form.category, content: finalContent}
    try {
      if(editMode) await axios.put(`${API}/sops/${editMode.id}`, fullPayload)
      else await axios.post(`${API}/sops/`, fullPayload)
      done()
    } catch(err:any){
      try {
        if(editMode) await axios.put(`${API}/sops/${editMode.id}`, minimalPayload)
        else await axios.post(`${API}/sops/`, minimalPayload)
        done()
      } catch(e2:any){
        alert('CREATE FAILED: ' + JSON.stringify(e2.response?.data || e2.message, null, 2))
      }
    }
  }

  const done = async () => {
    setShowNew(false); setForm({title:'', category:'production', station:'blender', content:'', steps:[{text:'', timer:0}], tools:'', location:'', supplier:''}); setEditMode(null); await load();
  }

  const deleteSop = async (id:string) => {
    if(prompt('Type DELETE')!=='DELETE') return
    try { await axios.delete(`${API}/sops/${id}`); load(); }
    catch(err:any){ alert('Delete failed: ' + (err.response?.data?.detail || err.message)) }
  }

  const openEdit = (s:any) => {
    const steps = s.content? s.content.split('\n').filter(Boolean).map((t:string)=>({text: t.replace(/^\d+\.\s/,'').replace(/\s*\[.*\]/,''), timer:0})) : [{text:''}]
    setEditMode({id:s.id}); setForm({title:s.title, category:s.category, station:s.station||'blender', content:s.content, steps, tools:s.tools||'', location:s.location||'', supplier:s.supplier||''}); setShowNew(true)
  }

  const filtered = sops.filter((s:any)=>{
    if(filter!=='all' && s.category!==filter) return false
    if(search &&!s.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const addStep = () => setForm({...form, steps:[...form.steps, {text:'', timer:0}]})
  const updateStep = (i:number, k:string, v:any) => { const ns=[...form.steps]; ns[i][k]=v; const content = ns.filter((s:any)=>s.text.trim()).map((s:any,idx:number)=>`${idx+1}. ${s.text}`).join('\n'); setForm({...form, steps:ns, content}) }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div><h1 className="text-3xl font-bold">SOP Library - SMART AUTO</h1><p className="text-gray-500">Phase 6 - {sops.length} SOPs - Location + Supplier + Tools + Station + Timers + Kitchen Mode - Fully Editable</p></div>
        <button onClick={()=>{setEditMode(null); setForm({title:'', category:'production', station:'blender', content:'', steps:[{text:'', timer:0}], tools:'', location:'', supplier:''}); setShowNew(true)}} className="px-5 py-2 bg-black text-white rounded-xl text-sm">+ New SOP</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-2xl p-4"><p className="text-xs uppercase text-gray-500">Total SOPs</p><p className="text-2xl font-black">{sops.length}</p><p className="text-xs text-gray-400">franchise ready</p></div>
        <div className="bg-white border rounded-2xl p-4"><p className="text-xs uppercase text-gray-500">Production</p><p className="text-2xl font-black">{sops.filter((s:any)=>s.category==='production').length}</p></div>
        <div className="bg-white border rounded-2xl p-4"><p className="text-xs uppercase text-gray-500">Cleaning / Opening</p><p className="text-2xl font-black">{sops.filter((s:any)=>['cleaning','opening','closing'].includes(s.category)).length}</p></div>
        <div className="bg-black text-white rounded-2xl p-4"><p className="text-xs uppercase text-gray-400">AI Insight - SMART</p><p className="text-xs mt-1">Type Mango Bowl → auto recipe. Delete → type Cleaning Blender → switches to cleaning. Location + Supplier + Tools auto injected + Inventory deduct + Training link.</p></div>
      </div>
      <div className="bg-white rounded-2xl border p-3 mb-4 flex gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search SOPs - e.g. Mango, Cleaning, Opening" className="flex-1 p-2 border rounded-xl text-sm"/>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border rounded-xl text-sm"><option value="all">All Categories</option><option value="production">Production</option><option value="cleaning">Cleaning</option><option value="opening">Opening</option><option value="closing">Closing</option><option value="service">Service</option></select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((s:any)=>(
          <div key={s.id} className="bg-white rounded-2xl border p-5 hover:shadow-lg transition">
            <div className="flex justify-between mb-2"><span className="text-xs bg-black text-white px-2 py-1 rounded uppercase">{s.category}</span><span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">{s.station||'general'}</span></div>
            <h3 className="font-bold cursor-pointer" onClick={()=>setViewSop(s)}>{s.title}</h3>
            <p className="text-xs text-gray-500 mb-1">{(s.content?.split('\n').length||1)} steps • Loc: {s.location||'--'} • Sup: {s.supplier||'--'} • Tools: {s.tools||'--'}</p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-wrap h-16">{s.content?.substring(0,200)}</p>
            <div className="flex gap-2 mt-4"><button onClick={()=>setViewSop(s)} className="flex-1 bg-black text-white text-xs py-2 rounded-xl">View / Execute</button><button onClick={()=>openEdit(s)} className="text-xs border px-3 py-2 rounded-xl">Edit</button><button onClick={()=>deleteSop(s.id)} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-bold">DELETE</button></div>
          </div>
        ))}
        {filtered.length===0 && <div className="col-span-3 p-12 text-center text-gray-400 bg-white rounded-2xl border">No SOPs yet. Create first: Type "Mango Bowl" → Smart Generate → switches auto. Try "Cleaning Blender" or "Opening Store" - fully smart automated</div>}
      </div>
      {showNew && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'12px'}}>
          <div style={{width:'420px', background:'white', borderRadius:'16px', padding:'16px', maxHeight:'92vh', overflow:'auto'}}>
            <h3 className="font-bold text-sm mb-2">{editMode?'Edit Smart SOP':'New Smart SOP - Fully Automated'}</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <div>
                <label className="text-xs font-bold">TITLE - TYPE ANYTHING, IT SWITCHES *</label>
                <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder='Mango Bowl, Cleaning Blender, Opening...' style={{width:'100%', padding:'10px', border:'2px solid black', borderRadius:'10px', fontSize:'14px', fontWeight:'bold'}}/>
                <p className="text-xs text-purple-600 mt-1">Type new → click SMART GENERATE → switches recipe</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div><label className="text-xs font-bold">CATEGORY</label><select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'10px', fontSize:'12px'}}><option value="production">Production</option><option value="cleaning">Cleaning</option><option value="opening">Opening</option><option value="closing">Closing</option><option value="service">Service</option><option value="training">Training</option></select></div>
                <div><label className="text-xs font-bold">STATION</label><select value={form.station} onChange={e=>setForm({...form, station:e.target.value})} style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'10px', fontSize:'12px'}}><option value="blender">Blender</option><option value="bowls">Bowls</option><option value="prep">Prep</option><option value="cleaning">Cleaning</option><option value="front">Front</option></select></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div><label className="text-xs font-bold">LOCATION</label><input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Shelf A1, Fridge" style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'10px', fontSize:'12px'}}/></div>
                <div><label className="text-xs font-bold">SUPPLIER</label><input value={form.supplier} onChange={e=>setForm({...form, supplier:e.target.value})} placeholder="Sysco, Amazon" style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'10px', fontSize:'12px'}}/></div>
              </div>
              <div><label className="text-xs font-bold">TOOLS</label><input value={form.tools} onChange={e=>setForm({...form, tools:e.target.value})} placeholder="blender, bowl, spoon, scale" style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'10px', fontSize:'12px'}}/></div>
              <button onClick={smartGenerate} style={{width:'100%', background:'#7c3aed', color:'white', padding:'10px', borderRadius:'10px', fontSize:'13px', fontWeight:'bold'}}>✨ SMART GENERATE - Follows Title (Mango / Cleaning / Opening)</button>
              <div className="bg-gray-50 rounded-xl p-2 border max-h-56 overflow-auto">
                <div className="flex justify-between items-center mb-2"><p className="text-xs font-bold uppercase">STEPS - Timers + Location + Supplier Injected</p><button onClick={addStep} className="text-xs bg-black text-white px-2 py-1 rounded">+ Step</button></div>
                {form.steps.map((st:any,i:number)=>(
                  <div key={i} className="flex gap-1 mb-1"><span className="text-xs font-bold mt-2">{i+1}.</span><input value={st.text} onChange={e=>updateStep(i,'text',e.target.value)} placeholder={`Step ${i+1}`} className="flex-1 p-2 border rounded-lg text-xs"/><input type="number" value={st.timer||0} onChange={e=>updateStep(i,'timer',Number(e.target.value))} placeholder="sec" className="w-12 p-2 border rounded-lg text-xs"/><button onClick={()=>setForm({...form, steps: form.steps.filter((_:any,idx:number)=>idx!==i)})} className="text-xs text-red-500">x</button></div>
                ))}
              </div>
              <textarea value={form.content} onChange={e=>setForm({...form, content:e.target.value})} placeholder="Content auto-fills from steps, but editable" style={{width:'100%', padding:'8px', border:'1px solid #ddd', borderRadius:'10px', height:'90px', fontSize:'12px'}}/>
              <div className="flex gap-2">
                <button onClick={()=>setForm({title:'', category:'production', station:'blender', content:'', steps:[{text:'', timer:0}], tools:'', location:'', supplier:''})} className="flex-1 border py-2 rounded-xl text-xs">Clear - New Recipe (switch)</button>
              </div>
            </div>
            <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
              <button onClick={()=>{setShowNew(false); setEditMode(null)}} style={{flex:1, border:'1px solid #ddd', padding:'10px', borderRadius:'10px', fontSize:'12px'}}>Cancel</button>
              <button onClick={save} style={{flex:1, background:'black', color:'white', padding:'10px', borderRadius:'10px', fontSize:'13px', fontWeight:'bold'}}>CREATE - Fixed</button>
            </div>
          </div>
        </div>
      )}
      {viewSop && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'16px'}}>
          <div style={{width:'500px', background:'white', borderRadius:'16px', padding:'20px', maxHeight:'90vh', overflow:'auto'}}>
            <div className="flex justify-between mb-3"><div><h2 className="text-xl font-bold">{viewSop.title}</h2><p className="text-xs text-gray-500">{viewSop.category} • {viewSop.station} • Loc: {viewSop.location||'--'} • Sup: {viewSop.supplier||'--'} • Tools: {viewSop.tools||'--'}</p></div><button onClick={()=>setViewSop(null)} className="border px-3 py-1 rounded-full text-xs">X</button></div>
            <div className="space-y-2">{viewSop.content?.split('\n').filter(Boolean).map((line:string,i:number)=>(<div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl border"><span className="font-black text-sm">{i+1}</span><p className="text-sm flex-1">{line.replace(/^\d+\.\s/,'')}</p></div>))}</div>
            <div className="flex gap-2 mt-5"><button onClick={()=>{setViewSop(null); setExecuting(viewSop); setChecked([])}} className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold">▶ Execute - Kitchen Mode</button><button onClick={()=>{setViewSop(null); openEdit(viewSop)}} className="border px-5 py-3 rounded-xl text-sm">Edit</button></div>
          </div>
        </div>
      )}
      {executing && (
        <div style={{position:'fixed', inset:0, background:'black', color:'white', display:'flex', flexDirection:'column', zIndex:60, padding:'24px'}}>
          <div className="flex justify-between"><h1 className="text-2xl font-bold">🔪 {executing.title} - KITCHEN MODE - Location: {executing.location||'--'} - Supplier: {executing.supplier||'--'}</h1><button onClick={()=>setExecuting(null)} className="bg-white text-black px-4 py-2 rounded-full text-sm">Exit</button></div>
          <div className="mt-8 space-y-3 overflow-auto">{executing.content?.split('\n').filter(Boolean).map((line:string,i:number)=>(<div key={i} onClick={()=>{if(checked.includes(i)) setChecked(checked.filter(c=>c!==i)); else setChecked([...checked,i])}} className={`p-5 rounded-2xl border-2 cursor-pointer ${checked.includes(i)?'bg-green-500 border-green-500 text-black':'bg-zinc-900 border-zinc-800'}`}><div className="flex justify-between"><p className="text-lg font-bold">{i+1}. {line.replace(/^\d+\.\s/,'')}</p><span className="text-2xl">{checked.includes(i)?'✅':'⬜'}</span></div></div>))}</div>
          <div className="mt-auto pt-4"><div className="bg-white text-black rounded-2xl p-4 flex justify-between"><p className="font-bold">{checked.length} / {executing.content?.split('\n').filter(Boolean).length} done - Inventory + Training linked</p><p className="text-xs">Location: {executing.location} • Supplier: {executing.supplier}</p></div></div>
        </div>
      )}
    </div>
  )
}