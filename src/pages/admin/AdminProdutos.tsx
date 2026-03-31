import React, { useState } from 'react';
import { useAgro } from '../../contexts/AgroContext';
import { Product } from '../../types';
import { Package, Edit2, Trash2, Plus, Image as ImageIcon, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '../../components/ImageUpload';

const AdminProdutos = () => {
  const { products, currentUser, addProduct, updateProduct, deleteProduct } = useAgro();
  
  // Filtra apenas os produtos da empresa atual
  const companyProducts = products.filter(p => p.companyId === currentUser?.companyId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    imageUrl: '',
  });

  const openAddModal = () => {
    setEditingId(null);
    setForm({ name: '', category: 'Frutas', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateProduct(editingId, form);
        toast.success('Produto atualizado com sucesso!');
      } else {
        const newProduct: Product = {
          id: crypto.randomUUID(),
          companyId: currentUser?.companyId || '',
          ...form,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addProduct(newProduct);
        toast.success('Produto cadastrado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar o produto.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
      toast.success('Produto excluído!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Catálogo de Produtos</h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie as variedades de produtos com fotos.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 w-full md:w-auto"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-20">Foto</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nome do Produto</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Categoria</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companyProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-slate-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 leading-tight">{product.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companyProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {companyProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            Nenhum produto cadastrado.
          </div>
        ) : (
          companyProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 leading-tight truncate">{product.name}</p>
                  <span className="inline-flex bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 mt-1">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Package className="text-emerald-600" />
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-sm font-semibold text-slate-700">Foto da Cultura/Produto</label>
                <div className="w-full">
                  <ImageUpload 
                    value={form.imageUrl}
                    onChange={(base64) => setForm({...form, imageUrl: base64})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nome do Produto</label>
                <input required type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Tomate Carmem" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Categoria</label>
                <select 
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="Frutas">Frutas</option>
                  <option value="Vegetais">Vegetais</option>
                  <option value="Grãos">Grãos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProdutos;