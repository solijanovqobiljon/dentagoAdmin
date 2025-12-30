import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Loader2, Edit3, Trash2, Plus, Search } from 'lucide-react';

function AddMahsulot() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const BASE_URL = "https://app.dentago.uz";
  const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzNmMDdjNzIxZmZkMjg0MGY3ZjYwYSIsImxvZ2luIjoiKzk5ODg4MDgzNjU1NiIsInVzZXJuYW1lIjoiU3VubmF0aWxsbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY3MDEwMTg4LCJleHAiOjE3Njc2MTQ5ODgsImF1ZCI6InlvdXItYXBwLXVzZXJzLU42Z3V6IiwiaXNzIjoieW91ci1hcHAtbmFtZS0yaURBRnZ3NyJ9.fG7Ej9MywUT3UaoRKHiw7PIfHpYb0_hvFv1EFCYcuvs";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/product`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        
        // API javobi success:true va data massivi ichida kelishini hisobga olamiz
        setProducts(response.data.data || []);
      } catch (err) {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Qidiruv filtri
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-[#00BCE4] mb-2" />
      <p className="text-gray-500 font-medium">Mahsulotlar yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header qismi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mahsulotlar Ombori</h1>
            <p className="text-gray-500 text-sm">Jami {products.length} ta mahsulot mavjud</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Mahsulot qidirish..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BCE4]/20 w-full md:w-64 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-[#00BCE4] hover:bg-[#00a6c9] text-white px-5 py-2 rounded-xl font-semibold transition-colors shadow-lg shadow-[#00BCE4]/20">
              <Plus size={18} /> Qo'shish
            </button>
          </div>
        </div>

        {/* Jadval (Table) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mahsulot</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kategoriya</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Narxi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                          {product.imageUrl?.[0] ? (
                            <img 
                              src={`${BASE_URL}/images/${product.imageUrl[0]}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-[#00BCE4] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-400">ID: {product._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                        {product.price?.toLocaleString()} <span className="text-[10px] text-gray-400 ml-1">UZS</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      Mahsulot topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMahsulot;