import { useState, useEffect } from "react";

type Link = {
  id: number;
  title: string;
  url: string;
  category: string;
  tags: string;
  notes: string;
  linked_product: string;
  created_at: string;
};

export default function LinksVault() {
  const [links, setLinks] = useState<Link[]>(() => {
    try { return JSON.parse(localStorage.getItem("belvera_links") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ title: "", url: "", category: "packaging", tags: "", notes: "", linked_product: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", url: "", category: "packaging", tags: "", notes: "", linked_product: "" });

  useEffect(() => { localStorage.setItem("belvera_links", JSON.stringify(links)); }, [links]);

  const handleCreate = (e: any) => {
    e.preventDefault();
    if(!form.title ||!form.url) return;
    setLinks([{...form, id: Date.now(), created_at: new Date().toISOString() },...links]);
    setForm({ title: "", url: "", category: "packaging", tags: "", notes: "", linked_product: "" });
  };

  const startEdit = (link: Link) => { setEditingId(link.id); setEditForm({ title: link.title, url: link.url, category: link.category, tags: link.tags, notes: link.notes, linked_product: link.linked_product }); };
  const saveEdit = () => { setLinks(links.map(l => l.id === editingId? {...l,...editForm } : l)); setEditingId(null); };
  const handleDelete = (id: number) => { if(confirm("Delete?")) setLinks(links.filter(l => l.id!== id)); };

  const filtered = links.filter(l => {
    const matchCat = filter === "all" || l.category === filter;
    const matchSearch = search === "" || `${l.title} ${l.tags} ${l.linked_product}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}>
              <span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">LINKS VAULT</span>
            </h1>
            <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">All branding • packaging • suppliers — {links.length} links • Luxury</p>
          </div>
          <div className="bg-[#111]/60 backdrop-blur-xl border border-white/10 rounded-full p-2 flex">
            <input className="bg-transparent px-4 py-2 w-64 outline-none text-sm placeholder:text-[#444] text-white" placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="w-8 h-8 bg-[#C9A86A] rounded-full flex items-center justify-center text-black text-xs">⌕</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleCreate} className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 h-fit sticky top-20 shadow-2xl">
            <h2 className="font-serif italic text-xl font-bold mb-1">+ Add Link</h2>
            <p className="text- text-[#666] uppercase tracking-widest mb-5">Save to vault</p>
            <div className="space-y-3">
              <input className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none" placeholder="Title — Amazon Bowls" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              <input className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-full text-sm text-white focus:border-[#C9A86A]/50 outline-none" placeholder="https://..." value={form.url} onChange={e => setForm({...form, url: e.target.value})} required />
              <select className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-full text-sm text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="packaging">📦 Packaging</option><option value="branding">🎨 Branding</option><option value="supplier">🚚 Supplier</option><option value="design">✏ Design</option><option value="inspiration">💡 Inspo</option><option value="other">Other</option></select>
              <input className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-full text-sm text-white" placeholder="Tags — bowl, 16oz" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
              <input className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-full text-sm text-white" placeholder="Linked Product — Acai Bowl" value={form.linked_product} onChange={e => setForm({...form, linked_product: e.target.value})} />
              <textarea className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-2xl text-sm text-white min-h-" placeholder="Notes..." rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <button className="w-full mt-5 bg-[#C9A86A] text-black p-3 rounded-full font-black text-sm hover:bg-[#D8B87A] shadow-[0_0_20px_rgba(201,168,106,0.3)] transition">SAVE TO VAULT</button>
          </form>

          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-6">{["all","packaging","branding","supplier","design","inspiration"].map(cat => (<button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text- uppercase tracking-widest font-bold transition ${filter===cat?"bg-[#C9A86A] text-black shadow-[0_0_15px_rgba(201,168,106,0.3)]":"bg-[#111]/60 border border-white/10 text-[#666] hover:text-white hover:border-white/20"}`}>{cat}</button>))}</div>

            <div className="grid gap-3">
              {filtered.map(link => (
                <div key={link.id} className="bg-[#111]/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-[#C9A86A]/20 hover:-translate-y-0.5 transition-all shadow-xl group">
                  {editingId === link.id? (
                    <div className="space-y-3">
                      <input className="w-full bg-black border border-white/10 p-3 rounded-full font-bold text-sm text-white" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      <input className="w-full bg-black border border-white/10 p-3 rounded-full text-sm text-white" value={editForm.url} onChange={e => setEditForm({...editForm, url: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2"><select className="bg-black border border-white/10 p-3 rounded-full text-sm text-white" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}><option value="packaging">Packaging</option><option value="branding">Branding</option><option value="supplier">Supplier</option><option value="design">Design</option><option value="inspiration">Inspiration</option><option value="other">Other</option></select><input className="bg-black border border-white/10 p-3 rounded-full text-sm text-white" value={editForm.tags} onChange={e => setEditForm({...editForm, tags: e.target.value})} /></div>
                      <input className="bg-black border border-white/10 p-3 rounded-full text-sm w-full text-white" value={editForm.linked_product} onChange={e => setEditForm({...editForm, linked_product: e.target.value})} />
                      <textarea className="bg-black border border-white/10 p-3 rounded-2xl text-sm w-full text-white" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
                      <div className="flex gap-2"><button onClick={saveEdit} className="bg-[#C9A86A] text-black px-6 py-2.5 rounded-full flex-1 font-bold text-sm">✓ Save Edit</button><button onClick={() => setEditingId(null)} className="bg-white/10 px-6 py-2.5 rounded-full flex-1 text-sm">Cancel</button></div>
                    </div>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3"><a href={link.url} target="_blank" className="font-bold text-white group-hover:text-[#C9A86A] transition truncate">{link.title}</a><span className="text- bg-white/10 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-widest text-[#C9A86A]">{link.category}</span></div>
                        <div className="text-xs text-[#666] mt-2 flex gap-2 flex-wrap">{link.tags && <span className="bg-[#0A0A0A] border border-white/5 px-2 py-1 rounded-full">#{link.tags}</span>}{link.linked_product && <span className="bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[#C9A86A] px-2.5 py-1 rounded-full text-">🔗 {link.linked_product}</span>}</div>
                        {link.notes && <div className="text-sm mt-3 bg-[#0A0A0A]/70 border border-white/5 p-3 rounded-xl text-white/70">{link.notes}</div>}
                        <div className="text- text-[#333] mt-2 truncate font-mono">{link.url}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a href={link.url} target="_blank" className="bg-white text-black text- px-4 py-2 rounded-full text-center font-bold hover:bg-[#C9A86A] transition">Open</a>
                        <button onClick={() => startEdit(link)} className="bg-white/5 border border-white/10 text-white text- px-4 py-2 rounded-full font-bold hover:bg-white/10">Edit</button>
                        <button onClick={() => handleDelete(link.id)} className="text-red-400/60 hover:text-red-400 text-">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length===0 && <div className="text-center p-16 border border-dashed border-white/10 rounded-2xl text-[#444] italic">No links — add your first ✨</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}