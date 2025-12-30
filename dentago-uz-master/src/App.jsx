import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataProvider';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import DashboardContent from './components/DashboardContent';
import CalendarContent from './components/CalendarContent';
import PaymentsContent from './components/PaymentsContent';
import LeadStatisticsContent from './components/LeadStatisticsContent';
import DoctorDailyReportsContent from './components/DoctorDailyReportsContent';
import GiveMoneyToDoctorsContent from './components/GiveMoneyToDoctorsContent';
import DailyExpensesContent from './components/DailyExpensesContent';
import DailyExpenseCategoriesContent from './components/DailyExpenseCategoriesContent';
import SmsTemplatesContent from './components/SmsTemplatesContent';
import SmsSettingsContent from './components/SmsSettingsContent';
import GeneralSettingsContent from './components/GeneralSettingsContent';
import ManualContent from './components/ManualContent';
import DocumentsContent from './components/storage/DocumentsContent';
import ProductsContent from './components/storage/ProductsContent';
import CategoriesContent from './components/storage/CategoriesContent';
import BrandsContent from './components/storage/BrandsContent';
import UnitsContent from './components/storage/UnitsContent';
import SuppliersContent from './components/storage/SuppliersContent';
import ProductUsageContent from './components/storage/ProductUsageContent';
import OrderList from './components/pages/BTS/OrderList';
import Yetkazibberish from './components/pages/BTS/yetkazibBeruvchi';
import Results from './components/Results';
import ProfileContent from './components/ProfileContent';
import AppPaymentsContent from './components/AppPaymentsContent';
import TariffsContent from './components/TariffsContent';
import Login from './components/Login';
import { Link } from 'lucide-react';
import Logo from "./assets/dentago.png"
const routeConfig = {
  "/hisobot/to'lovlar": "payments",
  '/hisobot/lead-statistika': "lead_statistics",
  '/hisobot/kunilik-xarajatlar': "daily_expenses",
  '/hisobot/kunilik-xarajatlar-kategoriyalari': "daily_expense_categories",
  '/sms/shablonlar': "sms_templates",
  '/sms/sozlamalar': "sms_settings",
  '/manual': "manual",
  '/storage/documents': "documents",
  '/storage/products': "products",
  '/storage/categories': "categories",
  '/storage/brands': "brands",
  '/storage/units': "units",
  '/storage/suppliers': "suppliers",
  '/storage': "warehouse",
  '/pages/BTS/orders': "orders_bts",
  '/orders': "orders_bts",
  '/result': "my_results",
  '/profile': "profile",
  '/payments/app': "app_payments",
  '/payments/tariffs': "tariffs",
  '/courses': "courses_title",
  '/storage/usage': "product_usage"
};

const getPageTitle = (pathname) => {
  if (pathname === '/') return "dashboard";
  if (routeConfig[pathname]) return routeConfig[pathname];

  const sortedKeys = Object.keys(routeConfig).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pathname.startsWith(key)) return routeConfig[key];
  }
  return "dashboard";
};

const MainLayout = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const pageKey = getPageTitle(location.pathname);
  const { theme, isAuthenticated, t } = useData();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!isAuthenticated) {
    return <Login />;
  }


  return (
    <div className={`flex h-[100vh] ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className="flex-1 overflow-x-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} currentPage={t(pageKey)} />
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="*" element={<div className="p-8 text-center text-xl font-bold">404 Sahifa topilmadi</div>} />
          <Route path="/hisobot/to'lovlar" element={<PaymentsContent />} />
          <Route path="/hisobot/lead-statistika" element={<LeadStatisticsContent />} />
          <Route path="/hisobot/kunilik-xarajatlar" element={<DailyExpensesContent />} />
          <Route path="/hisobot/kunilik-xarajatlar-kategoriyalari" element={<DailyExpenseCategoriesContent />} />
          <Route path="/sms/shablonlar" element={<SmsTemplatesContent />} />
          <Route path="/sms/sozlamalar" element={<SmsSettingsContent />} />
          <Route path="/settings/general" element={<GeneralSettingsContent />} />
          <Route path="/manual" element={<ManualContent />} />
          <Route path="/storage/documents" element={<DocumentsContent />} />
          <Route path="/storage/products" element={<ProductsContent />} />
          <Route path="/storage/categories" element={<CategoriesContent />} />
          <Route path="/storage/brands" element={<BrandsContent />} />
          <Route path="/storage/units" element={<UnitsContent />} />
          <Route path="/storage/suppliers" element={<SuppliersContent />} />
          <Route path="/storage/usage" element={<ProductUsageContent />} />
          <Route path="/storage" element={<ProductsContent />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/profile" element={<ProfileContent />} />
          <Route path="/payments/app" element={<AppPaymentsContent />} />
          <Route path="/payments/tariffs" element={<TariffsContent />} />
          <Route path="/yetkazibberish" element={<Yetkazibberish />} />
          <Route path="/result" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DataProvider>
      <MainLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <a href="https://t.me/dentalsoft_uz" target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-50 w-14 h-14 flex items-center justify-center bg-white border border-[#00BCE4] rounded-full cursor-pointer shadow-lg">
        {/* <Link className="text-white" size={24} /> */}
        <img src={Logo} alt="" />
      </a>
    </DataProvider>
  );
}

export default App;
