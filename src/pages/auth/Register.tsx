import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Users } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    paymentMethods: [] as any[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValidPhoneNumber = (phone: string) => {
    const normalized = phone.replace(/[^\d+]/g, '');
    return /^\+?\d{8,15}$/.test(normalized);
  };

  const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

  const inputClass = (field: string) =>
    `block w-full pl-10 pr-3 py-3 border rounded-lg transition-colors ${fieldErrors[field]
      ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    }`;

  const getPaymentMethod = (type: string) =>
    formData.paymentMethods.find((method: any) => method.type === type) as any;

  const bankMethod = getPaymentMethod('bank') || { bankName: '', accountNumber: '', accountName: '' };
  const mobileMethod = getPaymentMethod('mobile_money') || { accountName: '', phoneNumber: '' };

  const updatePaymentMethod = (type: string, values: any) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      Object.keys(values).forEach((key) => delete next[`${type}.${key}`]);
      return next;
    });

    setFormData(prev => {
      const methods = [...prev.paymentMethods];
      const index = methods.findIndex((method: any) => method.type === type);
      if (index >= 0) {
        methods[index] = { ...methods[index], ...values };
      } else {
        methods.push({
          type,
          name: type === 'bank' ? 'Bank Transfer' : 'Telebirr',
          accountNumber: '',
          accountName: '',
          phoneNumber: '',
          bankName: '',
          ...values,
        });
      }
      return { ...prev, paymentMethods: methods };
    });
  };

  const getCleanPaymentMethods = () => {
    return formData.paymentMethods
      .map((method: any) => ({
        ...method,
        bankName: method.bankName?.trim() || '',
        accountNumber: method.accountNumber?.trim() || '',
        accountName: method.accountName?.trim() || '',
        phoneNumber: method.phoneNumber?.trim() || '',
        instructions: method.instructions?.trim() || '',
      }))
      .filter((method: any) => {
        if (method.type === 'bank') {
          return Boolean(method.bankName || method.accountNumber || method.accountName);
        }
        if (method.type === 'mobile_money') {
          return Boolean(method.accountName || method.phoneNumber);
        }
        return false;
      });
  };

  const hasValidPaymentMethod = () => {
    return getCleanPaymentMethods().some((method: any) => {
      if (method.type === 'bank') {
        return Boolean(method.bankName && method.accountNumber);
      }
      if (method.type === 'mobile_money') {
        return Boolean(method.phoneNumber);
      }
      return false;
    });
  };

  const isRegisterDisabled =
    loading ||
    !formData.fullName.trim() ||
    !formData.email.trim() ||
    !formData.phoneNumber.trim() ||
    !formData.password ||
    !formData.confirmPassword ||
    !isValidPhoneNumber(formData.phoneNumber) ||
    !formData.referralCode.trim() ||
    !hasValidPaymentMethod();

  const { register } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number (8-15 digits, optional leading +).';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    }
    if (!formData.referralCode?.trim()) {
      errors.referralCode = 'Referral code is required.';
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please correct the highlighted fields.');
      setLoading(false);
      return;
    }

    const paymentMethods = getCleanPaymentMethods();
    const hasValidPaymentMethod = paymentMethods.some((method: any) => {
      if (method.type === 'bank') {
        return Boolean(method.bankName && method.accountNumber);
      }
      if (method.type === 'mobile_money') {
        return Boolean(method.phoneNumber);
      }
      return false;
    });

    if (!hasValidPaymentMethod) {
      setError('Please provide at least one valid payment method.');
      setLoading(false);
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: normalizePhone(formData.phoneNumber),
        password: formData.password,
        referralCode: formData.referralCode.trim(),
        paymentMethods,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        const parsedErrors: Record<string, string> = {};
        backendErrors.forEach((entry: any) => {
          if (entry.errors && entry.type) {
            const type = entry.type === 'bank' ? 'bank' : 'mobile';
            Object.entries(entry.errors).forEach(([key, message]: [string, any]) => {
              parsedErrors[`${type}.${key}`] = String(message);
            });
          }
        });
        if (Object.keys(parsedErrors).length) {
          setFieldErrors(parsedErrors);
          setError(err.response?.data?.message || 'Registration failed. Please review your merchant account details.');
          return;
        }
      }

      if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
        setFieldErrors(err.response.data.errors);
      }

      const msg = err.response?.data?.message;
      if (msg && /phone/i.test(msg)) {
        setFieldErrors(prev => ({ ...prev, phoneNumber: msg }));
        setError(msg);
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6 space-x-2">
            <TrendingUp className="w-12 h-12 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">molive Trading</span>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600">Start your investment journey today</p>
        </div>

        <div className="p-8 bg-white shadow-xl rounded-2xl">
          {error && (
            <div className="flex items-center p-4 mb-6 space-x-2 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className={inputClass('fullName')}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClass('email')}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className={inputClass('phoneNumber')}
                  placeholder="+251 9XX XXX XXX"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="referralCode" className="block mb-2 text-sm font-medium text-gray-700">
                Referral Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  required
                  className="block w-full py-3 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.referralCode && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.referralCode}</p>
              )}
            </div>

            {/* Payment Methods Section */}
            <div className="pt-5 border-t">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Payment Methods</h3>
              <p className="mb-4 text-sm text-gray-600">Provide at least one payment method so referrals can deposit to you.</p>

              {/* Bank Transfer */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Bank Transfer</h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    className={`block w-full px-3 py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500 ${fieldErrors['bank.bankName'] ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                    value={bankMethod.bankName}
                    onChange={(e) => updatePaymentMethod('bank', { bankName: e.target.value })}
                  />
                  {fieldErrors['bank.bankName'] && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors['bank.bankName']}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Account Number"
                    className={`block w-full px-3 py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500 ${fieldErrors['bank.accountNumber'] ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                    value={bankMethod.accountNumber}
                    onChange={(e) => updatePaymentMethod('bank', { accountNumber: e.target.value })}
                  />
                  {fieldErrors['bank.accountNumber'] && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors['bank.accountNumber']}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    className={`block w-full px-3 py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500 ${fieldErrors['bank.accountName'] ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                    value={bankMethod.accountName}
                    onChange={(e) => updatePaymentMethod('bank', { accountName: e.target.value })}
                  />
                  {fieldErrors['bank.accountName'] && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors['bank.accountName']}</p>
                  )}
                </div>
              </div>

              {/* Mobile Money */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Mobile Money (Telebirr)</h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    placeholder="Tele Username"
                    className={`block w-full px-3 py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500 ${fieldErrors['mobile.accountName'] ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                    value={mobileMethod.accountName}
                    onChange={(e) => updatePaymentMethod('mobile_money', { accountName: e.target.value })}
                  />
                  {fieldErrors['mobile.accountName'] && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors['mobile.accountName']}</p>
                  )}
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className={`block w-full px-3 py-2 border rounded-lg transition-colors focus:ring-2 focus:ring-emerald-500 ${fieldErrors['mobile.phoneNumber'] ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                    value={mobileMethod.phoneNumber}
                    onChange={(e) => updatePaymentMethod('mobile_money', { phoneNumber: e.target.value })}
                  />
                  {fieldErrors['mobile.phoneNumber'] && (
                    <p className="mt-2 text-sm text-red-600">{fieldErrors['mobile.phoneNumber']}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={inputClass('password')}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={inputClass('confirmPassword')}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                required
                className="w-4 h-4 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="agree" className="block ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-500">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-500">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isRegisterDisabled}
              className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}