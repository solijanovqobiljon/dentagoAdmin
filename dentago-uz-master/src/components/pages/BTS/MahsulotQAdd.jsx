import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, X, CheckCircle } from 'lucide-react';

const BASE_URL = "https://app.dentago.uz";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzNmMDdjNzIxZmZkMjg0MGY3ZjYwYSIsImxvZ2luIjoiKzk5ODg4MDgzNjU1NiIsInVzZXJuYW1lIjoiU3VubmF0aWxsbyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY3MDEwMTg4LCJleHAiOjE3Njc2MTQ5ODgsImF1ZCI6InlvdXItYXBwLXVzZXJzLU42Z3V6IiwiaXNzIjoieW91ci1hcHAtbmFtZS0yaURBRnZ3NyJ9.fG7Ej9MywUT3UaoRKHiw7PIfHpYb0_hvFv1EFCYcuvs";

function MahsulotQAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    salePercentage: 0,
    company: '',
    category: '',
    code: '',
    vat_percent: 0,
    description: '',
    sku: '',
    quantity: 1,
    deliveryDays: 0,
    package_code: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['price', 'salePercentage', 'vat_percent', 'quantity', 'deliveryDays'];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) || '' : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert("Faqat rasm fayllar yuklanishi mumkin!");
      return;
    }

    if (validFiles.length > 10) {
      alert("Maksimal 10 ta rasm yuklashingiz mumkin!");
      return;
    }

    setImages(prev => [...prev, ...validFiles.slice(0, 10 - prev.length)]);
    
    const newPreviews = validFiles.slice(0, 10 - previewImages.length).map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const uploadImagesToServer = async (imageFiles) => {
    const uploadedFilenames = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const formDataImage = new FormData();
        formDataImage.append('file', imageFiles[i]);
        formDataImage.append('upload_preset', 'product_images');
        
        let response;
        try {
          response = await axios.post(`${BASE_URL}/api/images`, formDataImage, {
            headers: {
              'Authorization': `Bearer ${TOKEN}`
            }
          });
        } catch (err) {
          try {
            response = await axios.post(`${BASE_URL}/api/upload/image`, formDataImage, {
              headers: {
                'Authorization': `Bearer ${TOKEN}`
              }
            });
          } catch (err2) {
            response = await axios.post(`${BASE_URL}/api/images/upload`, formDataImage, {
              headers: {
                'Authorization': `Bearer ${TOKEN}`
              }
            });
          }
        }

        if (response.data) {
          const filename = response.data.filename || 
                          response.data.url?.split('/').pop() || 
                          response.data.imageUrl || 
                          `image_${Date.now()}_${i}.jpg`;
          
          uploadedFilenames.push(filename);
        }
        
      } catch (error) {
        console.error(`Rasm ${i + 1} yuklanmadi:`, error.message);
      }
    }
    
    return uploadedFilenames;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['name', 'price', 'category', 'code', 'sku', 'package_code'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return value === undefined || value === null || value.toString().trim() === '';
    });

    if (missingFields.length > 0) {
      alert(`Xatolik! Quyidagi maydonlarni to'ldiring:\n${missingFields.join(', ')}`);
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      alert("Xatolik! Narx to'g'ri kiriting (0 dan katta bo'lishi kerak)");
      return;
    }

    setLoading(true);
    let uploadedImageUrls = [];

    try {
      if (images.length > 0) {
        setUploadingImages(true);
        uploadedImageUrls = await uploadImagesToServer(images);
        console.log("Yuklangan rasmlar:", uploadedImageUrls);
      }

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category.trim(),
        company: formData.company.trim() || "",
        price: Number(formData.price),
        description: formData.description.trim() || "",
        deliveryDays: Number(formData.deliveryDays) || 0,
        salePercentage: Number(formData.salePercentage) || 0,
        quantity: Number(formData.quantity) || 1,
        vat_percent: Number(formData.vat_percent) || 0,
        code: formData.code.trim(),
        package_code: formData.package_code.trim(),
        imageUrl: uploadedImageUrls
      };

      console.log("Yuborilayotgan ma'lumot:", payload);

      const response = await axios.post(`${BASE_URL}/api/product`, payload, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Server javobi:", response.data);

      const successMessage = `✅ Mahsulot muvaffaqiyatli qo'shildi!${
        uploadedImageUrls.length > 0 
          ? `\n${uploadedImageUrls.length} ta rasm yuklandi.` 
          : ''
      }`;
      
      alert(successMessage);

      setFormData({
        name: '',
        price: '',
        salePercentage: 0,
        company: '',
        category: '',
        code: '',
        vat_percent: 0,
        description: '',
        sku: '',
        quantity: 1,
        deliveryDays: 0,
        package_code: ''
      });
      
      setImages([]);
      setPreviewImages([]);
      
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (error) {
      console.error("Xatolik tafsilotlari:", error);
      
      let errorMessage = "Xatolik yuz berdi";
      
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        
        if (error.response.status === 401) {
          errorMessage = "Kirish rad etildi. Token eskirgan yoki noto'g'ri.";
        } else if (error.response.status === 400) {
          errorMessage = "Noto'g'ri so'rov. Ma'lumotlarni tekshiring.";
        } else if (error.response.status === 409) {
          errorMessage = "Bu kod yoki SKU bilan mahsulot allaqachon mavjud.";
        } else {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        "Server xatosi";
        }
      } else if (error.request) {
        errorMessage = "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring.";
      } else {
        errorMessage = error.message || "Noma'lum xatolik";
      }
      
      alert(`❌ ${errorMessage}`);
      
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-10xl mx-auto bg-white rounded-b-3xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-3xl">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            <ArrowLeft size={20} /> Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Yangi tovar qo'shish</h1>
          <div className="w-32"></div> {/* Balans uchun */}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          {/* Yuklash statusi */}
          {(loading || uploadingImages) && (
            <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" />
              <p className="text-blue-800 font-medium">
                {uploadingImages ? `Rasmlar yuklanmoqda... (${images.length} ta)` : "Saqlanmoqda..."}
              </p>
            </div>
          )}

          {/* 1-qator: Tovar nomi va Artikul (SKU) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Tovar nomi</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Artikul</label>
              <input 
                name="sku" 
                value={formData.sku} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* 2-qator: Narx va Kolичество */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Narx</label>
              <input 
                name="price" 
                type="number" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Kolичество</label>
              <input 
                name="quantity" 
                type="number" 
                value={formData.quantity} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Rasmlar va Yetkazib berish kunlari */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Rasmlar</label>
              <div className="flex items-center gap-4">
                <label className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700">
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-500">No file chosen</span>
              </div>

              {/* Preview */}
              {previewImages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {previewImages.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="preview" className="w-32 h-32 object-cover rounded-lg border" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Yetkazib berish kunlari</label>
              <input 
                name="deliveryDays" 
                type="number" 
                value={formData.deliveryDays} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Chegirma foizi va Kategoriya */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Chegirma foizi (%)</label>
              <input 
                name="salePercentage" 
                type="number" 
                value={formData.salePercentage} 
                onChange={handleChange} 
                min="0" max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Kategoriya</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              >
                <option value="">Kategoriyani tanlang</option>
                <option>Ortopediya</option>
                <option>Umumiy behushlik</option>
                <option>Terapiya</option>
                <option>Jarrohlik</option>
                <option>Dezinfeksiya va sterilizatsiya</option>
                <option>Sarf materiallari</option>
                <option>Polishing to‘plami</option>
                <option>Asboblar</option>
                <option>Stomatologik stullar va stullar</option>
                <option>Qo‘l asboblari va mikromotorlar</option>
                <option>Burlar</option>
                <option>Assimilatsiya qilish moslamalari</option>
                <option>Rentgen, vizograf va mikroskopik uskunalar</option>
                <option>Skalatorlar va qo‘shimchalar</option>
                <option>Fayllar</option>
                <option>Elektromotorlar va apekslokatorlar</option>
                <option>Sterilizatsiya uskunalar</option>
                <option>Shtiftlar</option>
                <option>Matritsalar</option>
              </select>
            </div>
          </div>

          {/* Kompaniya/Brend */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Kompaniya/Brend</label>
            <input 
              name="company" 
              value={formData.company} 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Kod */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Kod</label>
            <select 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">Kodni tanlang</option>
              {/* Backenddan kodlarni olish mumkin, hozircha placeholder */}
              <option>03004010003004001</option>
              <option>03004097001006002</option>
              {/* ... qolgan kodlar */}
            </select>
          </div>

          {/* NDS va Kod upakovki */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">НДС (%)</label>
              <input 
                name="vat_percent" 
                type="number" 
                value={formData.vat_percent} 
                onChange={handleChange} 
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Kod upakovki</label>
              <input 
                name="package_code" 
                value={formData.package_code} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Tavsif</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Saqlash tugmasi */}
          <div className="text-right pt-6">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Tovarni saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MahsulotQAdd;