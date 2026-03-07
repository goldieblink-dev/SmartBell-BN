import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, Lock, Mail, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            if (response.data.access_token) {
                localStorage.setItem('smartbell_token', response.data.access_token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 sm:p-12">
                    <div className="flex justify-center mb-8">
                        <div className="bg-primary-50 p-4 rounded-full">
                            <BellRing size={48} className="text-primary-600" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">SmartBell System</h1>
                        <p className="text-sm text-gray-500">Sign in to manage school bell schedules for SMK Bakti Nusantara 666</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="admin@smkbn666.sch.id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
