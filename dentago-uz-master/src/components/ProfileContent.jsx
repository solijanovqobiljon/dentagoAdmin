// src/components/ProfileContent.jsx
import React, { useState } from 'react';
import { useData } from '../context/DataProvider';
import { CheckCircle, Lock, Edit2, User } from 'lucide-react';
import EditProfileModal from './modals/EditProfileModal';
import ChangePasswordModal from './modals/ChangePasswordModal';

const ProfileContent = () => {
    const { data, t } = useData();
    // Default user data (mock) if not present in context or if corrupted (becomes empty array)
    const rawUser = data.user;
    const user = (rawUser && !Array.isArray(rawUser)) ? rawUser : {
        name: "Abduxalim",
        surname: "To'xtayev",
        role: "Sotuvchi",
        id: "133",
        createdAt: "11.09.2025 21:12",
        updatedAt: "26.09.2025 16:40",
        login: "test_admin",
        image: null
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const getInitials = () => {
        return `${user.name?.[0] || ''}${user.surname?.[0] || ''}`;
    };

    return (
        <div className="p-4 md:p-8 flex justify-center w-full">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center">

                {/* Avatar Section */}
                <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden">
                        {user.image ? (
                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                        )}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                        <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500" />
                    </div>
                </div>

                {/* Name & Role */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                    {user.name} {user.surname}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">{user.role}</p>

                {/* Info List */}
                <div className="w-full space-y-5 mb-8">
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider">ID</span>
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">{user.id}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider">{t('created_at')}</span>
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">{user.createdAt}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 pb-2">
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider">{t('updated_at')}</span>
                        <span className="text-gray-800 dark:text-gray-200 font-semibold">{user.updatedAt}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-medium transition-colors"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        {t('edit_personal_info')}
                    </button>
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        {t('change_password')}
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentUser={user}
                />
            )}
            {isPasswordModalOpen && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProfileContent;
