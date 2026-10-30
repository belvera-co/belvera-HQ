import { useEffect, useState } from 'react'
import axios from 'axios'
const API = 'http://localhost:8000/api/v1'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [sellable, setSellable] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [showNew, setShowNew] = useState(false)
  const [cart, setCart] = useState<any[]>([])

  const load = async () => {
    const [o,p,sell,s] = await Promise.all([
      axios.get(`${API}/orders`),
      axios.get(`${API}/products/`),
      axios.get(`${API}/sellable-for-cart`),
      axios.get(`${API}/sales/summary`)
    ])
    setOrders(o.data); setProducts(p.data); setSellable(sell.data || []); setSummary(s.data)
  }
  useEffect(()=>{load()},[])

  const addToCart = (item:any) => {
    const realPrice = Number(item.price?? item.sell_price?? item.cost_per_unit?? 0)
    const idKey = item.ingredient_id? `ing-${item.id}` : `prod-${item.id}`
    const ex = cart.find((i:any)=>i._key===idKey)
    if(ex){
      setCart(cart.map((i:any)=>i._key===idKey? {...i, quantity:i.quantity+1, total_price:(i.quantity+1)*i.unit_price} : i))
    } else {
      setCart([...cart, {
        _key: idKey,
        product_id: item.type==='product'? item.id : undefined,
        ingredient_id: item.ingredient_id || (item.type==='ingredient'? item.id : undefined),
        product_name: item.name,
        quantity: 1,
        unit_price: realPrice,
        total_price: realPrice
      }])
    }
  }

  const createOrder = async () => {
    if(cart.length===0){ alert('Add items'); return }
    const payloadItems = cart.map((i:any)=>({
      product_id: i.product_id,
      ingredient_id: i.ingredient_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price
    }))
    await axios.post(`${API}/orders`,{items:payloadItems, channel:'pos', payment_method:'cash', status:'paid'})
    setCart([]); setShowNew(false); load()
  }

  const deleteOrder = async (id:string) => {
    if(prompt('ADMIN DELETE - Type DELETE')!== 'DELETE') return
    await axios.delete(`${API}/orders/${id}`)
    load()
  }

  const subtotal = cart.reduce((s:any,i:any)=>s+i.total_price,0)
  const tps = subtotal * 0.05
  const tvq = subtotal * 0.09975
  const total = subtotal + tps + tvq

  const ingredientAddons = sellable.filter((x:any)=>x.type==='ingredient' || x.ingredient_id || x.is_sellable)
  const allProducts = products.length? products : sellable.filter((x:any)=>x.type==='product')

  return (
    <div className="min-h-screen bg-[#050505] text-white -m-6 p-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w- h- bg-[#C9A86A] opacity-[0.07] blur- rounded-full pointer-events-none"></div>
      <div className="absolute top-20 right-0 w- h- bg-blue-600 opacity-[0.05] blur- rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-5xl font-serif italic font-black tracking-tight" style={{fontFamily:'Playfair Display, serif'}}><span className="bg-gradient-to-r from-white to-[#C9A86A] bg-clip-text text-transparent">Orders & POS</span></h1>
          <p className="text-[#666] text- mt-2 tracking-[0.2em] uppercase">Real Price from Inventory — TPS/TVQ Smart • {orders.length} orders</p>
        </div>
        <button onClick={()=>setShowNew(true)} className="px-6 py-3 bg-[#C9A86A] text-black rounded-full text-sm font-bold hover:bg-[#D8B87A] shadow-[0_0_25px_rgba(201,168,106,0.4)] transition">+ New Sale</button>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
          <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-emerald-500/20 hover:-translate-y-1 transition-all"><p className="text- text-[#666] uppercase tracking-[0.2em]">Total Revenue</p><p className="text-3xl font-bold text-emerald-400 mt-2">${summary.total_revenue}</p></div>
          <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10"><p className="text- text-[#666] uppercase tracking-[0.2em]">Avg Order</p><p className="text-3xl font-bold mt-2">${summary.avg_order_value}</p></div>
          <div className="bg-[#111]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10"><p className="text- text-[#666] uppercase tracking-[0.2em]">Total Orders</p><p className="text-3xl font-bold mt-2">{summary.total_orders}</p></div>
          <div className="bg-gradient-to-br from-[#1A1500] to-black p-6 rounded-2xl border border-[#C9A86A]/20"><p className="text- text-[#C9A86A]/60 uppercase tracking-[0.2em]">Top Product</p><p className="font-bold text-[#C9A86A] mt-2">{summary.top_products?.[0]?.name||'--'}</p><p className="text-xs text-[#666] mt-1">best seller</p></div>
        </div>
      )}

      <div className="bg-[#111]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative z-10">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/50">
          <h3 className="font-semibold text-sm uppercase tracking-widest">Recent Orders ({orders.length})</h3>
          <span className="text- text-[#666] bg-white/5 px-3 py-1 rounded-full border border-white/10">Founder Only Delete</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#0A0A0A] text- uppercase tracking-[0.2em] text-[#C9A86A]/60"><tr><th className="p-4 text-left">Order #</th><th className="p-4 text-center">Customer</th><th className="p-4 text-center">Items</th><th className="p-4 text-center">Total</th><th className="p-4 text-center">Channel</th><th className="p-4 text-center">Action</th></tr></thead>
          <tbody>
            {orders.map((o:any)=>(
              <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.03] hover:border-l-2 hover:border-l-[#C9A86A] transition-all">
                <td className="p-4 font-mono text-xs text-left text-white/70">{o.order_number}</td>
                <td className="p-4 text-center text-white/80">{o.customer_name||'Walk-in'}</td>
                <td className="p-4 text-center"><span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs">{o.items_count}</span></td>
                <td className="p-4 text-center font-bold text-[#C9A86A]">${o.total}</td>
                <td className="p-4 text-center"><span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text- uppercase">{o.channel}</span></td>
                <td className="p-4 text-center"><button onClick={()=>deleteOrder(o.id)} className="text-xs text-red-400/60 hover:text-red-400 font-bold">Delete</button></td>
              </tr>
            ))}
            {orders.length===0 && <tr><td colSpan={6} className="p-16 text-center text-[#444] italic">No orders yet — click + New Sale ✨</td></tr>}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded- p-6 w- max-w- flex gap-6 shadow-2xl max-h-">
            <div className="flex-1 overflow-auto pr-2">
              <h3 className="font-serif italic text-xl font-bold mb-4">Products</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {allProducts.map((p:any)=>(
                  <div key={p.id} onClick={()=>addToCart(p)} className="p-4 bg-[#0A0A0A] border border-white/10 rounded-2xl cursor-pointer hover:bg-white hover:text-black hover:border-[#C9A86A] transition group">
                    <p className="font-semibold text-sm group-hover:text-black">{p.name}</p>
                    <p className="text-xs text-[#C9A86A] group-hover:text-black mt-1">${Number(p.price||0).toFixed(2)}</p>
                  </div>
                ))}
                {allProducts.length===0 && <p className="text-xs text-[#444] col-span-2">No products — add in Inventory with POS toggle</p>}
              </div>
              <h3 className="font-serif italic text-xl font-bold mb-3">🧊 Add-ons — Real Price</h3>
              <div className="grid grid-cols-2 gap-2">
                {ingredientAddons.map((p:any)=>(
                  <div key={p.id} onClick={()=>addToCart(p)} className="p-4 border border-[#C9A86A]/30 bg-[#C9A86A]/10 rounded-2xl cursor-pointer hover:bg-[#C9A86A] hover:text-black transition group">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-white/60 group-hover:text-black/60 mt-1">Stock: {p.stock} • ${Number(p.price||p.sell_price||p.cost_per_unit||0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-80 border-l border-white/10 pl-6 flex flex-col">
              <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-[#C9A86A]">Cart • TPS/TVQ Smart</h4>
              <div className="space-y-2 mb-4 flex-1 overflow-auto">
                {cart.map((i:any, idx:number)=><div key={idx} className="flex justify-between text-sm bg-[#0A0A0A] border border-white/5 p-3 rounded-xl"><span className="text-white/80">{i.product_name} x{i.quantity}</span><span className="font-bold text-[#C9A86A]">${i.total_price.toFixed(2)}</span></div>)}
                {cart.length===0 && <p className="text-xs text-[#444] italic">Empty — click a product</p>}
              </div>
              <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-2xl text-sm space-y-1.5 mb-4">
                <div className="flex justify-between text-white/60"><span>Sous-total</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-white/40 text-xs"><span>TPS 5%</span><span>${tps.toFixed(2)}</span></div>
                <div className="flex justify-between text-white/40 text-xs"><span>TVQ 9.975%</span><span>${tvq.toFixed(2)}</span></div>
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-black text-base"><span>Total</span><span className="text-[#C9A86A]">${total.toFixed(2)}</span></div>
              </div>
              <button onClick={createOrder} className="w-full py-3 bg-[#C9A86A] text-black rounded-full font-black hover:bg-[#D8B87A] shadow-[0_0_20px_rgba(201,168,106,0.3)]">Charge ${total.toFixed(2)}</button>
              <button onClick={()=>setShowNew(false)} className="mt-2 w-full py-2.5 border border-white/10 rounded-full text-sm hover:bg-white/5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}