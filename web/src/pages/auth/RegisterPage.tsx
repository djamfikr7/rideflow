import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, registerWithPhone } from '../../lib/auth';
import { useAuth } from '../../store/useAuth';
import { MOCK_OTP } from '../../lib/constants';

type Step = 'details' | 'otp';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phone);
      setStep('otp');
    } catch {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpStr = otp.join('');

    if (otpStr.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const { valid } = await verifyOTP(phone, otpStr);
      if (!valid) {
        setError('Invalid OTP');
        return;
      }

      const { user, token } = await registerWithPhone(fullName.trim(), phone, role);
      setAuth(user, token);

      if (user.role === 'driver') {
        navigate('/driver', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="pt-12 pb-8 px-6">
          <button onClick={() => setStep('details')} className="text-gray-500 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Verify your number</h1>
          <p className="text-gray-500 mt-1">
            Enter the 6-digit code sent to {phone}
          </p>
        </div>

        <div className="flex-1 px-6">
          <form onSubmit={handleVerify} className="max-w-sm mx-auto space-y-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-center">
                <strong>Testing:</strong> Enter <code className="bg-blue-100 px-1 rounded">{MOCK_OTP}</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {loading ? 'Creating account...' : 'Verify & Register'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="pt-12 pb-8 px-6">
        <button onClick={() => navigate('/login')} className="text-gray-500 mb-4">
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-1">Join RideFlow today</p>
      </div>

      <div className="flex-1 px-6">
        <form onSubmit={handleSendOTP} className="max-w-sm mx-auto space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+1</span>
              <input
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="(555) 123-4567"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('rider')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  role === 'rider'
                    ? 'border-accent bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">🧑</span>
                <span className="font-medium text-gray-900">Ride</span>
                <p className="text-xs text-gray-500 mt-1">Request rides</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  role === 'driver'
                    ? 'border-accent bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">🚗</span>
                <span className="font-medium text-gray-900">Drive</span>
                <p className="text-xs text-gray-500 mt-1">Earn money</p>
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 text-center">
              <strong>Testing:</strong> OTP is always <code className="bg-blue-100 px-1 rounded">{MOCK_OTP}</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {loading ? 'Sending...' : 'Continue'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
