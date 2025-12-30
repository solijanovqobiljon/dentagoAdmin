import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, FileText, Send, Settings, BookOpen,
    ChevronDown, ListOrdered, DollarSign, TrendingUp, LayoutList,
    Archive, User, PlusCircle, ArrowLeft
} from 'lucide-react';
import { BsInstagram, BsTelegram } from 'react-icons/bs';
import { MdEmail } from 'react-icons/md';
import { useData } from '../../context/DataProvider';
import Logo from '../../assets/dentago.png';
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const { t } = useData();

    const [openMenus, setOpenMenus] = useState({
        ombor: false,
        hisobot: false,
        sms: false,
        settings: false,
    });

    const handleMenuToggle = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    useEffect(() => {
        if (location.pathname.startsWith('/storage')) setOpenMenus(prev => ({ ...prev, ombor: true }));
        if (location.pathname.startsWith('/hisobot')) setOpenMenus(prev => ({ ...prev, hisobot: true }));
        if (location.pathname.startsWith('/sms')) setOpenMenus(prev => ({ ...prev, sms: true }));
        if (location.pathname.startsWith('/settings')) setOpenMenus(prev => ({ ...prev, settings: true }));
    }, [location.pathname]);

    const navItems = [
        { icon: Home, label: t('main'), route: "/", type: "link" },
        { icon: User, label: t('my_results'), route: "/result", type: "link" },
        { icon: ListOrdered, label: t('orders_bts'), route: "/orders", type: "link" },
        {
            icon: Archive,
            label: t('warehouse'),
            route: "/storage",
            type: "group",
            name: "ombor",
            subItems: [
                { label: t('documents'), route: "/storage/documents" },
                { label: t('products'), route: "/storage/products" },
                { label: t('categories'), route: "/storage/categories" },
                { label: t('brands'), route: "/storage/brands" },
                { label: t('units'), route: "/storage/units" },
                { label: t('suppliers'), route: "/storage/suppliers" },
                { label: t('product_usage'), route: "/storage/usage" },
            ]
        },
        {
            icon: FileText,
            label: t('reports'),
            route: "/hisobot",
            type: "group",
            name: "hisobot",
            subItems: [
                { label: t('payments'), route: "/hisobot/to'lovlar", icon: DollarSign },
                { label: t('lead_statistics'), route: "/hisobot/lead-statistika", icon: TrendingUp },
                { label: t('daily_expenses'), route: "/hisobot/kunilik-xarajatlar", icon: ListOrdered },
                { label: t('daily_expense_categories'), route: "/hisobot/kunilik-xarajatlar-kategoriyalari", icon: LayoutList },
            ]
        },
        {
            icon: Send,
            label: t('sms'),
            route: "/sms",
            type: "group",
            name: "sms",
            subItems: [
                { label: t('sms_templates'), route: "/sms/shablonlar" },
                { label: t('sms_settings'), route: "/sms/sozlamalar" },
            ]
        },
        {
            icon: Settings,
            label: t('settings'),
            route: "/settings",
            type: "group",
            name: "settings",
            subItems: [
                { label: t('general_settings'), route: "/settings/general" },
            ]
        },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-all duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <aside className={`
                fixed top-0 left-0 h-full bg-blue-50 z-50
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                w-72 flex flex-col justify-between border-r border-blue-50
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:h-screen
            `}>

                <div className="flex-1 flex flex-col relative min-h-0">
                    {/* Brand Identity */}
                    <div className="p-8 pb-6 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img className='h-[150px] mt-[-73px]' src={Logo} alt="" />
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 left-2 p-2 text-slate-400">
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    {/* Quick Action Button */}
                    <div className="px-6 mb-8 mt-[-60px]">
                        <a
                            href="https://dentago.uz/dashboard"
                            className="flex items-center justify-center gap-3 w-full h-14 bg-blue-50 text-[#00BCE4] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00BCE4] hover:text-white transition-all duration-300 shadow-sm"
                        >
                            <PlusCircle size={18} />
                            Mahsulot qo'shish
                        </a>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-10">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.route || (item.type === "group" && location.pathname.startsWith(item.route));

                            return (
                                <div key={index} className="space-y-1">
                                    {item.type === "link" ? (
                                        <Link
                                            to={item.route}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300
                                                ${isActive
                                                    ? 'bg-[#00BCE4] text-white'
                                                    : 'text-slate-400 font-bold hover:bg-[#00BCE4] hover:text-slate-50'}
                                            `}
                                        >
                                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                            <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleMenuToggle(item.name)}
                                                className={`
                                                    w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300
                                                    ${isActive
                                                        ? 'bg-slate-50 text-[#00BCE4]'
                                                        : 'text-slate-400 font-bold hover:bg-[#00BCE4] hover:text-slate-50'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                                    <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
                                                </div>
                                                <ChevronDown size={16} className={`transition-transform duration-300 ${openMenus[item.name] ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Sub-menu Dropdown */}
                                            <div className={`
                                                overflow-hidden transition-all duration-500
                                                ${openMenus[item.name] ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}
                                            `}>
                                                <div className="pl-5 space-y-1">
                                                    {item.subItems.map((sub, sIdx) => {
                                                        const isSubActive = location.pathname === sub.route;
                                                        return (
                                                            <Link
                                                                key={sIdx}
                                                                to={sub.route}
                                                                onClick={() => setIsSidebarOpen(false)}
                                                                className={`
                                                                    block py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all
                                                                    ${isSubActive
                                                                        ? 'text-white bg-[#00BCE4]'
                                                                        : 'text-slate-400 hover:text-[#00BCE4] hover:translate-x-1'}
                                                                `}
                                                            >
                                                                {sub.label}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-50">
                    <Link
                        to="/manual"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                            flex items-center gap-4 px-5 py-4 rounded-2xl mb-6 transition-all
                            ${location.pathname === '/manual'
                                ? 'bg-[#00BCE4] text-white shadow-lg'
                                : 'text-slate-500 font-bold hover:bg-white'}
                        `}
                    >
                        <BookOpen size={20} />
                        <span className="text-[11px] uppercase tracking-widest">{t('manual')}</span>
                    </Link>

                    {/* Social Connect */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-blue-50">
                        <a href="https://t.me/Dentago_uz" className="p-2 text-slate-400 hover:text-[#00BCE4] transition-colors"><BsTelegram size={20} /></a>
                        <a href="https://www.instagram.com/dentago__uz" className="p-2 text-slate-400 hover:text-pink-600 transition-colors"><BsInstagram size={20} /></a>
                        <a href="mailto:ddentago@gmail.com" className="p-2 text-slate-400 hover:text-red-500 transition-colors"><MdEmail size={22} /></a>
                    </div>

                    <p className="text-center mt-6 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        &copy; 2025 DentaGo Platform
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
