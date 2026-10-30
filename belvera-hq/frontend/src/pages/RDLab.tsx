import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function RDLab() {
  const [products, setProducts] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [showVersion, setShowVersion] = useState(false)
  const [versionForm, setVersionForm] = useState<any>({version_number:'1.0', taste_score:8, texture_score:8})
  const [prodForm, setProdForm] = useState<any>({name:'', product_code:'', collection:'signature', description:''})
  const [editMode, setEditMode] = useState<any>(null)

  const load = async () => {
    const [p,i] = await Promise.all([axios.get(`${API}/products/`), axios.get(`${API}/ingredients`)])
    setProducts(p.data); setIngredients(i.data)
  }
  useEffect(()=>{load()},[])

  const loadVersions = async (prod:any) => {
    setSelectedProduct(prod)
    const res = await axios.get(`${API}/products/${prod.id}/versions`)
    setVersions(res.data)
  }

  const createProduct = async () => {
    if(editMode){
      await axios.put(`${API}/products/${editMode.id}`, prodForm)
    } else {
      await axios.post(`${API}/products/`, prodForm)
    }
    setShowNew(false); setProdForm({name:'', product_code:'', collection:'signature', description:''}); setEditMode(null); load()
  }

  const deleteProduct = async (id:string) => {
    const t = prompt('ADMIN DELETE - Founder only: Type DELETE')
    if(t!=='DELETE') return
    await axios.delete(`${API}/products/${id}`)
    load(); setSelectedProduct(null)
  }

  const deleteVersion = async (id:string) => {
    const t = prompt('ADMIN DELETE: Type DELETE')
    if(t!=='DELETE') return
    await axios.delete(`${API}/products/versions/${id}`)
    if(selectedProduct) loadVersions(selectedProduct)
  }

  const openEdit = (p:any) => {
    setEditMode({id:p.id})
    setProdForm({name:p.name, product_code:p.product_code, collection:p.collection, description:p.description})
    setShowNew(true)
  }

  const createVersion = async () => {
    await axios.post(`${API}/products/${selectedProduct.id}/versions`, versionForm)
    setShowVersion(false); setVersionForm({version_number:'1.0', taste_score:8, texture_score:8}); loadVersions(selectedProduct)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">R&D Lab</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">Products fully editable + deletable • Founder only • {products.length} products</p>
        </div>
        <button onClick={()=>{setEditMode(null); setProdForm({name:'', product_code:'', collection:'signature', description:''}); setShowNew(true)}} className="px-6 py-3 bg-[#C9A86A] text-black rounded-full text-sm font-bold hover:bg-[#D8B87A] shadow-[0_0_25px_rgba(201,168,106,0.4)]">+ New Product</button>
      </div>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-fit">
          <div className="p-5 border-b border-white/5 bg-[#0A0A0A]/50 flex justify-between"><h3 className="font-bold text-xs uppercase tracking-widest">Products ({products.length})</h3><span className="text- text-[#C9A86A]">SELECT</span></div>
          <div className="divide-y divide-white/5 max-h- overflow-auto">
            {products.map((p:any)=>(
              <div key={p.id} className={`p-4 hover:bg-white/[0.03] cursor-pointer transition-all ${selectedProduct?.id===p.id?'bg-[#C9A86A]/10 border-l-2 border-l-[#C9A86A]':'border-l-2 border-l-transparent'}`}>
                <div onClick={()=>loadVersions(p)}>
                  <p className={`font-bold ${selectedProduct?.id===p.id?'text-[#C9A86A]':'text-white'}`}>{p.name}</p>
                  <p className="text- text-[#666] mt-1">{p.product_code} • {p.collection} • v{p.current_version||'1.0'}</p>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button onClick={()=>openEdit(p)} className="text- border border-white/10 px-3 py-1 rounded-full hover:bg-white/10">Edit</button>
                  <button onClick={()=>deleteProduct(p.id)} className="text- text-red-400/60 hover:text-red-400 px-2">Delete</button>
                </div>
              </div>
            ))}
            {products.length===0 && <p className="p-10 text-center text-[#444] italic text-sm">No products</p>}
          </div>
        </div>

        <div className="col-span-2 bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl min-h-">
          {!selectedProduct? <div className="text-center py-20"><p className="text-4xl mb-4">🧪</p><p className="text-[#444] italic">Select a product to see versions and recipe</p><p className="text-xs text-[#333] mt-2">Luxury R&D</p></div> : (
            <div>
              <div className="flex justify-between mb-6 pb-6 border-b border-white/5">
                <div><h3 className="text-2xl font-serif italic font-bold">{selectedProduct.name}</h3><p className="text-sm text-[#666] mt-2">{selectedProduct.description||'No description'}</p><p className="text- text-[#C9A86A] mt-2 uppercase tracking-widest">{selectedProduct.product_code} • {selectedProduct.collection}</p></div>
                <button onClick={()=>setShowVersion(true)} className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-[#C9A86A] transition h-fit">+ New Version</button>
              </div>
              <div className="space-y-3">
                {versions.map((v:any)=>(
                  <div key={v.id} className="p-4 bg-[#0A0A0A] border border-white/10 rounded-2xl flex justify-between items-center hover:border-[#C9A86A]/20 transition">
                    <div>
                      <p className="font-bold text-sm">Version {v.version_number} — <span className="text-[#C9A86A]">Taste {v.taste_score}/10</span> — Texture {v.texture_score}/10</p>
                      <p className="text-xs text-[#666] mt-1">{v.testing_notes||'No notes'}</p>
                    </div>
                    <button onClick={()=>deleteVersion(v.id)} className="text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full">Delete</button>
                  </div>
                ))}
                {versions.length===0 && <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl text-[#444] italic text-sm">No versions yet — add first version ✨</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w- shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold mb-5">{editMode? 'Edit Product — Admin' : 'New Product'}</h3>
            <div className="space-y-3">
              <input value={prodForm.name} onChange={e=>setProdForm({...prodForm, name:e.target.value})} placeholder="Product Name *" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none"/>
              <input value={prodForm.product_code} onChange={e=>setProdForm({...prodForm, product_code:e.target.value})} placeholder="Code (BV-STR-001)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              <select value={prodForm.collection} onChange={e=>setProdForm({...prodForm, collection:e.target.value})} className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"><option value="signature">Signature</option><option value="functional">Functional</option><option value="seasonal">Seasonal</option></select>
              <textarea value={prodForm.description} onChange={e=>setProdForm({...prodForm, description:e.target.value})} placeholder="Description" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-sm text-white min-h-"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>{setShowNew(false); setEditMode(null)}} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={createProduct} className="flex-1 bg-[#C9A86A] text-black py-3 rounded-full font-bold text-sm">{editMode?'Save Changes':'Create'}</button></div>
          </div>
        </div>
      )}

      {showVersion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w- shadow-2xl">
            <h3 className="font-serif italic text-xl font-bold mb-5">New Version</h3>
            <div className="space-y-3">
              <input value={versionForm.version_number} onChange={e=>setVersionForm({...versionForm, version_number:e.target.value})} placeholder="Version (e.g. 1.1)" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={versionForm.taste_score} onChange={e=>setVersionForm({...versionForm, taste_score:Number(e.target.value)})} placeholder="Taste /10" className="p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
                <input type="number" value={versionForm.texture_score} onChange={e=>setVersionForm({...versionForm, texture_score:Number(e.target.value)})} placeholder="Texture /10" className="p-3.5 bg-[#0A0A0A] border border-white/10 rounded-full text-sm text-white"/>
              </div>
              <textarea value={versionForm.testing_notes||''} onChange={e=>setVersionForm({...versionForm, testing_notes:e.target.value})} placeholder="Testing notes" className="w-full p-3.5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-sm text-white"/>
            </div>
            <div className="flex gap-2 mt-6"><button onClick={()=>setShowVersion(false)} className="flex-1 border border-white/10 py-3 rounded-full text-sm">Cancel</button><button onClick={createVersion} className="flex-1 bg-white text-black py-3 rounded-full font-bold text-sm">Add Version</button></div>
          </div>
        </div>
      )}
    </div>
  )
}