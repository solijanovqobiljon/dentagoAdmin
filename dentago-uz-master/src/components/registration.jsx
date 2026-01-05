import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useData } from '../context/DataProvider';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Phone, Upload, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import DentaGo from "../assets/dentago.png";

const Registration = () => {
    const { loginWithPhone } = useData();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const [phoneNumber, setPhoneNumber] = useState('+998');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [gender, setGender] = useState('male');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSmsStep, setIsSmsStep] = useState(false); // SMS bosqichi
    const [smsCode, setSmsCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [inputBorderState, setInputBorderState] = useState('default');

    const inputsRef = useRef([]);

    useEffect(() => {
        const savedPhone = localStorage.getItem('pendingRegisterPhone');
        if (savedPhone && savedPhone.startsWith('+998')) {
            setPhoneNumber(savedPhone);
            localStorage.removeItem('pendingRegisterPhone');
        }
    }, []);

    const formatPhoneNumber = (value) => {
        let numbers = value.replace(/\D/g, '');
        if (!numbers.startsWith('998')) {
            numbers = '998' + numbers.replace(/^998/, '');
        }

        let formatted = '+998';
        if (numbers.length > 3) formatted += '-' + numbers.substring(3, 5);
        if (numbers.length > 5) formatted += '-' + numbers.substring(5, 8);
        if (numbers.length > 8) formatted += '-' + numbers.substring(8, 10);
        if (numbers.length > 10) formatted += '-' + numbers.substring(10, 12);

        return formatted;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatBirthDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    // SMS jo'natish
    const sendSmsForRegistration = async () => {
        setIsLoading(true);
        setError('');

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const fullPhone = `+${cleanPhone}`;

        try {
            const response = await fetch('https://app.dentago.uz/api/auth/app/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCountdown(60);
                setIsSmsStep(true);

                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError(data.message || 'SMS joʻnatishda xato yuz berdi');
            }
        } catch (err) {
            setError('Internet aloqasi muammosi');
        } finally {
            setIsLoading(false);
        }
    };

    // Ro'yxatdan o'tish + SMS jo'natish
    const onSubmitPersonalData = async (data) => {
        setError('');
        setIsLoading(true);

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const fullPhone = `+${cleanPhone}`;

        if (cleanPhone.length < 12) {
            setError('Toʻliq telefon raqamini kiriting');
            setIsLoading(false);
            return;
        }

        const payload = {
            username: `${data.firstName.trim()} ${data.lastName.trim()}`,
            birthdate: formatBirthDate(data.birthDate),
            gender: gender,
            phone: fullPhone,
            serviceId: true
        };

        try {
            const response = await fetch('https://app.dentago.uz/api/auth/app/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Ro'yxatdan o'tish muvaffaqiyatli → SMS jo'natamiz
                localStorage.setItem('userPhone', fullPhone);
                await sendSmsForRegistration();
            } else {
                setError(result.message || 'Roʻyxatdan oʻtishda xato');
            }
        } catch (err) {
            setError('Server bilan aloqa xatosi');
        } finally {
            setIsLoading(false);
        }
    };

    // SMS kodni tasdiqlash
    const handleSmsConfirm = async (code) => {
        if (code.length !== 6) return;

        setIsLoading(true);
        setError('');
        setInputBorderState('default');

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const fullPhone = `+${cleanPhone}`;

        try {
            const response = await fetch('https://app.dentago.uz/api/auth/app/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: fullPhone, otp: code }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setInputBorderState('success');

                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
                localStorage.setItem('userPhone', fullPhone);

                loginWithPhone(fullPhone);

                // Darhol bosh sahifaga
                setTimeout(() => navigate('/dashboard'), 800);
            } else {
                setInputBorderState('error');
                setError(data.message || 'Kod notoʻgʻri');
                setSmsCode('');
                inputsRef.current.forEach(input => input && (input.value = ''));
                inputsRef.current[0]?.focus();
            }
        } catch (err) {
            setInputBorderState('error');
            setError('Tasdiqlashda xato');
            setSmsCode('');
            inputsRef.current.forEach(input => input && (input.value = ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmsInputChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newCodeArr = smsCode.split('');
        newCodeArr[index] = value;
        const newCode = newCodeArr.join('');
        setSmsCode(newCode);
        setInputBorderState('default');

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }

        if (newCode.length === 6) {
            handleSmsConfirm(newCode);
        }
    };

    const handleBackToForm = () => {
        setIsSmsStep(false);
        setSmsCode('');
        setError('');
        setInputBorderState('default');
        inputsRef.current.forEach(input => input && (input.value = ''));
    };

    const getBorderClass = () => {
        if (inputBorderState === 'success') return 'border-green-500 bg-green-50';
        if (inputBorderState === 'error') return 'border-red-500 bg-red-50';
        return 'border-gray-200 focus:border-blue-500';
    };

    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex min-h-screen w-full overflow-hidden font-sans">
                <div className="hidden lg:block lg:w-3/5 relative overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop"
                            alt="Dental Office"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-1/3"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center p-12">
                        <div className="max-w-lg">
                            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                                <span className="text-blue-300">DentaGo</span> ga Ro'yxatdan o'ting
                            </h1>
                            <p className="text-gray-200 text-lg leading-relaxed">
                                Yangi hisob yarating va zamonaviy stomatologiya boshqaruv platformasidan foydalaning.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-8 lg:p-12">
                    <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10">
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                <img src={DentaGo} alt="DentaGo" className="w-48" />
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {isSmsStep ? 'Tasdiqlash kodi' : 'Ro\'yxatdan o\'tish'}
                            </h2>
                            <p className="text-gray-500">
                                {isSmsStep ? 'Telefoningizga yuborilgan kodni kiriting' : 'Shaxsiy ma\'lumotlaringizni to\'ldiring'}
                            </p>
                        </div>

                        {!isSmsStep ? (
                            <form onSubmit={handleSubmit(onSubmitPersonalData)} className="space-y-6">
                                {/* Profil rasmi */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-400" />
                                            )}
                                        </div>
                                        <label htmlFor="image" className="absolute bottom-0 right-0 bg-[#00C1F3] rounded-full p-2 cursor-pointer shadow-lg">
                                            <Upload className="w-5 h-5 text-white" />
                                        </label>
                                    </div>
                                    <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    <p className="text-sm text-gray-500 mt-3">Profil rasmini yuklang (ixtiyoriy)</p>
                                </div>

                                {/* Barcha maydonlar (ism, familiya, jins, sana, telefon) */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Ism *</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input {...register('firstName', { required: 'Ismni kiriting' })} type="text" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ismingiz" />
                                        </div>
                                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Familiya *</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input {...register('lastName', { required: 'Familiyani kiriting' })} type="text" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Familiyangiz" />
                                        </div>
                                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Jins *</label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} className="w-4 h-4 text-blue-600" />
                                                <span>Erkak</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={(e) => setGender(e.target.value)} className="w-4 h-4 text-blue-600" />
                                                <span>Ayol</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Tug'ilgan sana *</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <input {...register('birthDate', { required: 'Sanani tanlang' })} type="date" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Telefon raqami</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <input type="text" value={phoneNumber} onChange={handlePhoneChange} readOnly className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800" />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-[#00C1F3] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? 'Yuborilmoqda...' : 'Roʻyxatdan oʻtish'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <button onClick={handleBackToForm} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 -ml-2">
                                        <ArrowLeft className="w-5 h-5" />
                                        <span className="text-sm font-medium">Orqaga</span>
                                    </button>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{phoneNumber}</p>
                                        <p className="text-xs text-gray-500">Kod yuborildi</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700 text-center">6 raqamli kod</label>
                                    <div className="flex justify-between gap-3">
                                        {[...Array(6)].map((_, i) => (
                                            <input
                                                key={i}
                                                ref={el => inputsRef.current[i] = el}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="1"
                                                value={smsCode[i] || ''}
                                                onChange={(e) => handleSmsInputChange(i, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !smsCode[i] && i > 0) {
                                                        inputsRef.current[i - 1]?.focus();
                                                    }
                                                }}
                                                className={`w-full h-16 text-center text-3xl font-bold rounded-xl border-2 ${getBorderClass()} outline-none transition-all text-gray-900`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="text-center pt-2">
                                    {countdown > 0 ? (
                                        <p className="text-sm text-gray-500">Yangi kod: {countdown} s</p>
                                    ) : (
                                        <button onClick={sendSmsForRegistration} className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                                            Kod kelmadimi? <span className="font-semibold">Qayta yuborish</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-center text-xs text-gray-400">
                                Davom etish orqali shartlarga rozilik bildirasiz
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Registration;