// src/components/modals/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const EditProfileModal = ({ isOpen, onClose, currentUser }) => {
    const { t, updateData } = useData();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        login: '',
        image: null
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                surname: currentUser.surname || '',
                login: currentUser.login || '',
                image: currentUser.image || null
            });
        }
    }, [currentUser]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // DataProvider update
        updateData('user', {
            ...currentUser,
            ...formData,
            updatedAt: new Date().toLocaleString()
        }, 'UPDATE');

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('edit_personal_info')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('your_name')}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                        />
                    </div>

                    {/* Surname */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('your_surname')}
                        </label>
                        <input
                            type="text"
                            value={formData.surname}
                            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                        />
                    </div>

                    {/* Login */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Login
                        </label>
                        <input
                            type="text"
                            value={formData.login}
                            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
                        >
                            <Upload className="w-5 h-5 mr-2" />
                            {t('upload_image')}
                        </button>
                        {formData.image && (
                            <div className="mt-2 text-center text-sm text-green-600 dark:text-green-400">
                                Rasm tanlandi
                            </div>
                        )}
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-colors"
                    >
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
