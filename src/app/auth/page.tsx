'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, isAuthenticated, isAdmin, error, clearError, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  // Clear errors when toggling tabs
  const handleTabChange = (tab: 'login' | 'signup') => {
    clearError();
    setActiveTab(tab);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginEmail, loginPassword);
    if (success) {
      // router handles redirect via useEffect
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup(signupName, signupEmail, signupPassword);
    if (success) {
      // router handles redirect via useEffect
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#E5E4E0] shadow-xl p-8 text-left animate-slide-up">
        
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold tracking-widest text-[#1A1A1A]">NOVA</span>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Global Wardrobe & Editorial styling</p>
        </div>

        {/* Tabs selector */}
        <div className="flex border-b border-gray-100 mb-8 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => handleTabChange('login')}
            className={`w-1/2 pb-3 text-center border-b-2 transition-all ${
              activeTab === 'login' ? 'border-black text-black' : 'border-transparent text-gray-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`w-1/2 pb-3 text-center border-b-2 transition-all ${
              activeTab === 'signup' ? 'border-black text-black' : 'border-transparent text-gray-400'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="client@nova.com (or admin@nova.com)"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 pl-10 pr-3 py-3 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="client123 (or admin123)"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 pl-10 pr-3 py-3 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A1A1A] hover:bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
            
            <div className="text-center pt-2 text-[10px] text-gray-400 font-light space-y-1.5 border-t border-gray-100 mt-6">
              <p>Demo Admin: <span className="font-bold text-gray-600">admin@nova.com</span> / password: <span className="font-bold text-gray-600">admin123</span></p>
              <p>Demo Customer: <span className="font-bold text-gray-600">client@nova.com</span> / password: <span className="font-bold text-gray-600">client123</span></p>
            </div>
          </form>
        )}

        {/* 2. SIGNUP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 pl-10 pr-3 py-3 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="johndoe@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 pl-10 pr-3 py-3 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Create Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-gray-200 pl-10 pr-3 py-3 text-xs focus:outline-none focus:border-black font-light text-gray-800"
                  required
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A1A1A] hover:bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Create Account'}
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center font-light leading-relaxed pt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy regarding SSL session architecture.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
