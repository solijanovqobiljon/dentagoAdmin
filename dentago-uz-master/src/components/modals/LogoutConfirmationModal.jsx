// src/components/modals/LogoutConfirmationModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useData();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('confirmation')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-8 flex flex-col items-center text-center">
                    {/* Icon Placeholder (Red Circle) */}
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        {/* <div className="w-8 h-8 bg-red-500 rounded-full opacity-20"></div> */}
                        {/* Use logout icon or similar if needed, screenshot shows mostly just faint circle */}
                    </div>

                    <p className="text-gray-800 dark:text-gray-200 font-medium text-lg mb-2">
                        {t('logout_confirmation_message')}
                    </p>
                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t('no_close')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                        {t('yes_logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationModal;
