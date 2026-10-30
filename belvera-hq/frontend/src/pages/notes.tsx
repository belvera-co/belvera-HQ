import { useEffect, useState } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  created_at?: string;
};

const colors: any = {
  yellow: "bg-yellow-100 border-yellow-400",
  blue: "bg-blue-100 border-blue-400",
  green: "bg-green-100 border-green-400",
  red: "bg-red-100 border-red-400",
  purple: "bg-purple-100 border-purple-400",
  gray: "bg-gray-100 border-gray-400",
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [color, setColor] = useState("yellow");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);

  const API = "http://localhost:8000/api/v1";

  const load = async () => {
    const res = await fetch(`${API}/notes`);
    const data = await res.json();
    setNotes(Array.isArray(data)? data : []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return alert("Add title");
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category, color }),
    });
    setTitle(""); setContent("");
    load();
  };

  const update = async () => {
    if (!editing) return;
    await fetch(`${API}/notes/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await fetch(`${API}/notes/${id}`, { method: "DELETE" });
    load();
  };

  const duplicate = async (n: Note) => {
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: n.title + " (copy)", content: n.content, category: n.category, color: n.color }),
    });
    load();
  };

  const filtered = notes.filter(n => {
    if (filter!== "all" && n.category!== filter) return false;
    if (search &&!`${n.title} ${n.content}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">📝 Notes — Fully Modifiable</h1>
        <div className="flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="border p-2 rounded text-sm" />
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="border p-2 rounded text-sm">
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="ideas">Ideas</option>
            <option value="todo">To-Do</option>
            <option value="recipe">Recipe Notes</option>
          </select>
        </div>
      </div>

      {/* CREATE */}
      <div className="bg-white p-4 rounded-lg shadow border mb-8">
        <h3 className="font-bold mb-2">New Note</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border p-2 rounded col-span-2" />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="border p-2 rounded">
            <option value="general">General</option>
            <option value="ideas">Ideas</option>
            <option value="todo">To-Do</option>
            <option value="recipe">Recipe Notes</option>
          </select>
          <select value={color} onChange={e=>setColor(e.target.value)} className="border p-2 rounded">
            <option value="yellow">Yellow</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
            <option value="purple">Purple</option>
            <option value="gray">Gray</option>
          </select>
        </div>
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Your note content..." className="border p-2 rounded w-full h-24 mt-3" />
        <button onClick={create} className="mt-3 bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800">+ Add Note</button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map(n => (
          <div key={n.id} className={`p-4 rounded-lg shadow border-l-4 ${colors[n.color] || colors.yellow} relative group`}>
            {editing?.id === n.id? (
              <>
                <input value={editing.title} onChange={e=>setEditing({...editing, title: e.target.value})} className="border p-1 rounded w-full mb-2 font-bold" />
                <textarea value={editing.content} onChange={e=>setEditing({...editing, content: e.target.value})} className="border p-1 rounded w-full h-24 mb-2 text-sm" />
                <div className="flex gap-2 mb-2">
                  <select value={editing.category} onChange={e=>setEditing({...editing, category: e.target.value})} className="border p-1 rounded text-xs">
                    <option value="general">General</option><option value="ideas">Ideas</option><option value="todo">To-Do</option><option value="recipe">Recipe</option>
                  </select>
                  <select value={editing.color} onChange={e=>setEditing({...editing, color: e.target.value})} className="border p-1 rounded text-xs">
                    <option value="yellow">Yellow</option><option value="blue">Blue</option><option value="green">Green</option><option value="red">Red</option><option value="purple">Purple</option><option value="gray">Gray</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={update} className="bg-black text-white px-3 py-1 rounded text-xs">Save</button>
                  <button onClick={()=>setEditing(null)} className="bg-gray-200 px-3 py-1 rounded text-xs">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base">{n.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={()=>setEditing(n)} className="text-xs bg-white px-2 py-1 rounded border">Edit</button>
                    <button onClick={()=>duplicate(n)} className="text-xs bg-white px-2 py-1 rounded border">Copy</button>
                    <button onClick={()=>del(n.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </div>
                </div>
                <p className="text- uppercase tracking-widest text-gray-500 mb-1">{n.category} • {n.color}</p>
                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {filtered.length===0 && <p className="text-center text-gray-400 mt-10">No notes found.</p>}
    </div>
  );
}