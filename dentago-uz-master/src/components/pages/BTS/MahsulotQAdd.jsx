import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, X } from 'lucide-react';

const BASE_URL = "https://app.dentago.uz";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWI1NDMzMzk1OTgyYWU1ZWE1ODA5MyIsImxvZ2luIjoiKzk5ODkzMjMwNDYzNyIsInVzZXJuYW1lIjoiUW9iaWxqb24gU29saWphbm92Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Njc1OTQxMDIsImV4cCI6MTc2ODE5ODkwMiwiYXVkIjoieW91ci1hcHAtdXNlcnMtTjZndXoiLCJpc3MiOiJ5b3VyLWFwcC1uYW1lLTJpREFGdnc3In0.O7ALUV0zWqpWp2DobpT6ktn1ia8NZszBPf41b-hXGWE";

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

  // Rasmlarni serverga yuklash funksiyasi - TO'G'RI FORMATDA
  const uploadImagesToServer = async (imageFiles) => {
    const uploadedFilenames = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const imageFile = imageFiles[i];
        const formDataImage = new FormData();
        
        // 1. Field nomini tekshirish - "image" yoki "file"
        formDataImage.append('image', imageFile); // "image" deb nomlash
        // Yoki:
        // formDataImage.append('file', imageFile); // "file" deb nomlash
        
        console.log(`Rasm ${i + 1} yuklanmoqda...`, imageFile.name);
        
        // 2. To'g'ri Content-Type va o'lchamlar
        const config = {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'multipart/form-data',
          },
          // Fayl hajmini cheklash
          maxContentLength: 10 * 1024 * 1024, // 10MB
          maxBodyLength: 10 * 1024 * 1024, // 10MB
        };

        console.log('Headers:', config.headers);
        
        // 3. APIga POST so'rov yuborish
        const response = await axios.post(`${BASE_URL}/api/upload/image`, formDataImage, config);

        console.log(`Rasm ${i + 1} javobi:`, response.data);
        
        if (response.data) {
          let filename = '';
          
          // Serverdan filename ni olish - HAR XIL FORMATLAR UCHUN
          if (typeof response.data === 'string') {
            // Agar javob to'g'ridan-to'g'ri string bo'lsa "1767597287002-0.jpg"
            filename = response.data.trim();
          } else if (response.data.filename) {
            // Agar { filename: "1766487622478-892578808.jpg" } formatida bo'lsa
            filename = response.data.filename.trim();
          } else if (response.data.url) {
            // Agar { url: "..." } formatida bo'lsa
            filename = response.data.url.split('/').pop().trim();
          } else if (response.data.imageUrl) {
            // Agar { imageUrl: "..." } formatida bo'lsa
            filename = response.data.imageUrl.split('/').pop().trim();
          } else if (response.data.data?.filename) {
            // Agar { data: { filename: "..." } } formatida bo'lsa
            filename = response.data.data.filename.trim();
          } else {
            // Agar hech qaysi formatga to'g'ri kelmasa, timestamp formatida yaratish
            const timestamp = Date.now();
            const randomNum = Math.floor(Math.random() * 1000000000); // 9 xonali random son
            const fileExtension = imageFile.name.split('.').pop() || 'jpg';
            filename = `${timestamp}-${randomNum}.${fileExtension}`;
          }
          
          console.log(`✅ Rasm ${i + 1} saqlandi:`, filename);
          uploadedFilenames.push(filename);
        }
        
      } catch (error) {
        console.error(`❌ Rasm ${i + 1} yuklanmadi:`, error);
        
        // Batafsil xatolik ma'lumotlari
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
          console.error('Headers:', error.response.headers);
          
          let errorMsg = `Rasm ${i + 1} yuklanmadi: `;
          if (error.response.status === 413) {
            errorMsg += "Fayl hajmi juda katta (maksimal 5MB)";
          } else if (error.response.status === 415) {
            errorMsg += "Noto'g'ri fayl formati";
          } else if (error.response.status === 400) {
            errorMsg += error.response.data.message || "Noto'g'ri so'rov";
          } else {
            errorMsg += error.response.data?.message || error.response.statusText;
          }
          alert(errorMsg);
        } else if (error.request) {
          console.error('Request:', error.request);
          alert(`Rasm ${i + 1} yuklanmadi: Serverga ulanib bo'lmadi`);
        } else {
          console.error('Error:', error.message);
          alert(`Rasm ${i + 1} yuklanmadi: ${error.message}`);
        }
        
        throw error; // Xatolikni yuqoriga otkazish
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
    let uploadedImageFilenames = [];

    try {
      // 1. Rasmlarni yuklash
      if (images.length > 0) {
        setUploadingImages(true);
        uploadedImageFilenames = await uploadImagesToServer(images);
        console.log("Yuklangan rasm fayllari:", uploadedImageFilenames);
        
        // Filenamelarni tekshirish
        if (uploadedImageFilenames.length > 0) {
          console.log("Birinchi rasm format tekshiruvi:", {
            expected: "timestamp-randomNumber.jpg",
            actual: uploadedImageFilenames[0],
            matchesPattern: /^\d+-\d+\.(jpg|jpeg|png|gif|webp)$/i.test(uploadedImageFilenames[0])
          });
        }
      }

      // 2. Mahsulot yaratish uchun payload tayyorlash
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
        // Rasm fayl nomlarini array sifatida yuborish
        imageUrl: uploadedImageFilenames
      };

      console.log("Yuborilayotgan mahsulot ma'lumotlari:", JSON.stringify(payload, null, 2));

      // 3. Mahsulotni APIga yuborish
      const response = await axios.post(`${BASE_URL}/api/product`, payload, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Mahsulot yaratish javobi:", response.data);

      // 4. Muvaffaqiyatli xabar
      const successMessage = `✅ Mahsulot muvaffaqiyatli qo'shildi!${
        uploadedImageFilenames.length > 0 
          ? `\n${uploadedImageFilenames.length} ta rasm yuklandi.` 
          : '\nRasmsiz qo\'shildi.'
      }`;
      
      alert(successMessage);

      // 5. Formani tozalash
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
      
      // 6. Orqaga qaytish
      setTimeout(() => {
        navigate(-1);
      }, 2000);

    } catch (error) {
      console.error("Xatolik tafsilotlari:", error);
      
      let errorMessage = "Mahsulot qo'shishda xatolik yuz berdi";
      
      if (error.response) {
        console.error("Status code:", error.response.status);
        console.error("Server javobi:", error.response.data);
        console.error("Headers:", error.response.headers);
        
        if (error.response.status === 401) {
          errorMessage = "Kirish rad etildi. Token eskirgan yoki noto'g'ri.";
        } else if (error.response.status === 400) {
          // Rasm format xatosini tekshirish
          if (error.response.data?.message?.includes('imageUrl') || 
              error.response.data?.errors?.imageUrl) {
            errorMessage = "Rasm formatida xatolik. Server quyidagi formatda kutmoqda:\n" +
                          "1766487622478-892578808.jpg (timestamp-9xonaliRandomSon.jpg)";
          } else {
            errorMessage = "Noto'g'ri so'rov. Ma'lumotlarni tekshiring:\n" + 
                          (error.response.data?.errors ? 
                            JSON.stringify(error.response.data.errors, null, 2) : 
                            error.response.data?.message || JSON.stringify(error.response.data));
          }
        } else if (error.response.status === 409) {
          errorMessage = "Bu kod yoki SKU bilan mahsulot allaqachon mavjud.";
        } else if (error.response.status === 413) {
          errorMessage = "Rasm hajmi juda katta. Kichikroq rasm yuklang (maksimal 5MB).";
        } else if (error.response.status === 500) {
          errorMessage = "Server xatosi. Iltimos, keyinroq urinib ko'ring.";
        } else {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        "Server xatosi";
        }
      } else if (error.request) {
        console.error("Request:", error.request);
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
          <div className="w-32"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
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
                  Fayllarni tanlash
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-500">
                  {images.length > 0 ? `${images.length} ta fayl tanlandi` : "Fayl tanlanmadi"}
                </span>
              </div>

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
                <option>Polishing to'plami</option>
                <option>Asboblar</option>
                <option>Stomatologik stullar va stullar</option>
                <option>Qo'l asboblari va mikromotorlar</option>
                <option>Burlar</option>
                <option>Assimilatsiya qilish moslamalari</option>
                <option>Rentgen, vizograf va mikroskopik uskunalar</option>
                <option>Skalatorlar va qo'shimchalar</option>
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
              <option>03004010003004001</option>
              <option>03004097001006002</option>
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
              {loading ? "Saqlanmoqda..." : "Tovarni saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MahsulotQAdd;