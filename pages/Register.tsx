
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { UserPlus, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
    const { login } = useAuth();
    const [step, setStep] = useState<'EMAIL' | 'OTP' | 'DETAILS'>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStep('OTP');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStep('DETAILS');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, name, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            login(data.user);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an account</h2>
                </div>

                {error && (
                    <div className="bg-red-50 p-4 rounded-md flex items-start gap-2 text-red-700 text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {step === 'EMAIL' && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" isLoading={loading} className="w-full">
                            Send Verification Code
                        </Button>
                    </form>
                )}

                {step === 'OTP' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="text-sm text-gray-500 text-center">
                            Code sent to <strong>{email}</strong>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border text-center text-2xl tracking-widest"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <Button type="submit" isLoading={loading} className="w-full">
                            Verify Code
                        </Button>
                        <button type="button" onClick={() => setStep('EMAIL')} className="w-full text-sm text-indigo-600 hover:text-indigo-500">
                            Change Email
                        </button>
                    </form>
                )}

                {step === 'DETAILS' && (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="block w-full pl-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" isLoading={loading} className="w-full">
                            Complete Registration
                        </Button>
                    </form>
                )}

                <div className="text-center text-sm">
                    <p className="text-gray-600">Already have an account? <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Login</a></p>
                </div>
            </div>
        </div>
    );
};
