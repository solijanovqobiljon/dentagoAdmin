import React, { useState, useEffect, useRef } from 'react';
import { User, Stethoscope, Clock, TrendingUp, DollarSign, Calendar, Users, Briefcase, ChevronRight, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { MdMedicalServices } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { RiWallet3Line } from "react-icons/ri";
import { useData } from '../context/DataProvider';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DashboardContent = () => {
    const { data, t, logout } = useData();
    const navigate = useNavigate();
    const dateInputRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState('2025-01-12');

    // Oferta modal holati
    const [showOfferModal, setShowOfferModal] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('offerAccepted');
        if (!accepted) {
            setShowOfferModal(true);
        }
    }, []);

    const handleAcceptOffer = () => {
        localStorage.setItem('offerAccepted', 'true');
        setShowOfferModal(false);
    };

    const handleRejectOffer = () => {
        logout();
        navigate('/login');
    };

    const parseCurrency = (str) => {
        if (!str) return 0;
        if (typeof str === 'number') return str;
        return parseInt(str.toString().replace(/\s/g, '').replace("so'm", '')) || 0;
    };

    const formatCurrency = (num) => {
        return num.toLocaleString() + " so'm";
    };

    // Data Processing
    const services = data.services || [];
    const payments = data.payments || [];
    const patients = data.patients || [];
    const staff = data.staff || [];
    const btsOrders = data.btsOrders || [];
    const user = data.user || {};

    const sellerName = user.role === 'Sotuvchi' ? `${user.name} ${user.surname}` : null;
    const sellerServicesCount = sellerName ? btsOrders.filter(order => order.doctor?.includes(sellerName)).length : 0;
    const dentistsCount = staff.filter(s => s.position === 'Shifokor').length;
    const staffCount = staff.length;
    const deliveredProductsCount = btsOrders.filter(order => order.statusId === 4).length;

    const totalPayments = payments.reduce((sum, p) => sum + parseCurrency(p.amount), 0);
    const totalDebt = patients.reduce((sum, p) => {
        const debt = parseCurrency(p.debt);
        return debt < 0 ? sum + Math.abs(debt) : sum;
    }, 0);

    const chartData = [
        { name: t('cash') || 'Naqd', value: payments.filter(p => p.type === 'Naqd').reduce((s, p) => s + parseCurrency(p.amount), 0) },
        { name: t('card') || 'Karta', value: payments.filter(p => p.type === 'Karta').reduce((s, p) => s + parseCurrency(p.amount), 0) },
        { name: t('bank_transfer') || 'Hisob raqam', value: payments.filter(p => p.type === 'Hisob raqam' || p.type === 'Bank').reduce((s, p) => s + parseCurrency(p.amount), 0) },
        { name: 'K-to-K', value: payments.filter(p => p.type === 'Kartadan-kartaga').reduce((s, p) => s + parseCurrency(p.amount), 0) },
    ];

    const topStats = [
        { title: "Ko'rsatilgan Xizmatlar", value: sellerServicesCount, icon: MdMedicalServices, link: "#" },
        { title: "Stomatologlar Soni", value: dentistsCount, icon: FaUserDoctor, link: "#" },
        { title: "Xodimlar Soni", value: staffCount, icon: Users, link: "/klinika/xodimlar" },
        { title: "Yetkazilgan Mahsulotlar", value: deliveredProductsCount, icon: Briefcase, link: "#" },
    ];

    return (
        <div className="bg-[#f8fdff] min-h-screen font-sans">
            {/* Oferta Modal */}
            {showOfferModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#00BCE4]/20 backdrop-blur-sm" onClick={handleRejectOffer} />

                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn border border-[#00BCE4]/20">
                        {/* Header */}
                        <div className="p-8 bg-gradient-to-r from-[#00BCE4] to-[#0096b8] text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-2xl">
                                    <ShieldCheck size={40} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight">🦷 Dentago Platformasi</h2>
                                    <p className="text-sm opacity-90 mt-1">Zubtexniklar uchun ommaviy oferta shartnomasi</p>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-700">
                            <div className="bg-[#e6f8fc] rounded-2xl p-6 border border-[#00BCE4]/30">
                                <p className="text-md leading-relaxed">
                                    Ushbu ommaviy oferta Dentago platformasi va Platformada ro‘yxatdan o‘tgan zubtexnik o‘rtasida tuziladi.
                                </p>
                                <p className="mt-4 text-[#00BCE4] font-bold">
                                    Xizmatlardan foydalanish orqali siz shartlarni to‘liq qabul qilgan hisoblanasiz.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-lg font-bold text-[#00BCE4] mb-3 uppercase">1. Umumiy qoidalar</h3>
                                    <ol className="space-y-2 list-decimal list-inside ml-2">
                                        <li>Dentago — stomatologlar va zubtexniklar o‘rtasidagi raqamli platforma.</li>
                                        <li>Abonent to‘lovi: <span className="font-bold">200 000 so‘m/oy.</span></li>
                                    </ol>
                                </section>

                                <section className="bg-red-50 rounded-2xl p-6 border border-red-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                        <h3 className="text-lg font-bold text-red-800 uppercase">Jarima choralari</h3>
                                    </div>
                                    <p className="text-sm text-red-700">
                                        Buyurtmani asossiz bajarmaslik holatida Platformaga to‘langan summaning <span className="font-black">10 baravari</span> miqdorida jarima qo‘llanilishi mumkin.
                                    </p>
                                </section>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleRejectOffer}
                                className="flex-1 py-4 px-8 text-slate-500 font-bold rounded-2xl border border-slate-200 hover:bg-white transition-all"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleAcceptOffer}
                                className="flex-[2] py-4 px-8 bg-[#00BCE4] hover:bg-[#0096b8] text-white font-bold rounded-2xl shadow-lg shadow-[#00BCE4]/30 transition-all hover:scale-[1.01]"
                            >
                                Roziman va davom etish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Asosiy Dashboard */}
            <div className="p-4 md:p-8 space-y-6">
                {/* Top Stats */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topStats.map((stat, index) => (
                        <Link to={stat.link} key={index} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex justify-between items-center transition-all hover:border-[#00BCE4]/50 hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#e6f8fc] rounded-xl text-[#00BCE4]">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                        </Link>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{t('payments')}</h3>
                                <p className="text-xs text-slate-400 font-medium">To'lovlar dinamikasi</p>
                            </div>
                            <button
                                onClick={() => dateInputRef.current?.showPicker()}
                                className="flex items-center gap-2 px-4 py-2 bg-[#e6f8fc] rounded-xl text-xs font-bold text-[#00BCE4] hover:bg-[#d1f2f9] transition-all"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>{selectedDate}</span>
                                <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none" onChange={(e) => setSelectedDate(e.target.value)} />
                            </button>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00BCE4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#00BCE4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#00BCE4" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Services */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">{t('top_services') || "Ommabop xizmatlar"}</h3>
                        <div className="space-y-3">
                            {services.slice(0, 6).map((service, index) => (
                                <div key={service.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#fcfdfe] border border-slate-50 hover:border-[#00BCE4]/30 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#00BCE4] flex items-center justify-center text-white font-bold shadow-lg shadow-[#00BCE4]/20">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 truncate w-32">{service.name || "Xizmat"}</p>
                                            <p className="text-[10px] text-[#00BCE4] font-black uppercase tracking-tighter">{service.status || "AKTIV"}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-slate-700">{service.price || "0 so'm"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
            `}</style>
        </div>
    );
};

export default DashboardContent;
