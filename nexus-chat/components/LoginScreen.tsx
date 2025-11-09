
import React, { useState } from 'react';
import { generateUsername, generateAvatar } from '../services/geminiService';
import { User } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUser, setGeneratedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'generating' | 'generated'>('initial');

  const handleGenerate = async () => {
    setStep('generating');
    setIsLoading(true);
    setError(null);
    setGeneratedUser(null);
    try {
      const username = await generateUsername();
      const avatarUrl = await generateAvatar(username);
      setGeneratedUser({ username, avatarUrl });
      setStep('generated');
    } catch (err) {
      setError('Failed to generate user profile. Please try again.');
      setStep('initial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 text-center transition-all duration-500 transform">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Nexus Chat</h1>
        <p className="text-gray-400 mb-8">Your AI-Powered Chat Identity</p>
        
        {step === 'initial' && (
          <div className="animate-fade-in">
            <p className="text-gray-300 mb-6">Click below to generate your unique username and super-resolution avatar.</p>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Identity
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center h-48 animate-fade-in">
            <LoadingSpinner size="12" />
            <p className="mt-4 text-gray-300">Forging your digital identity...</p>
          </div>
        )}
        
        {step === 'generated' && generatedUser && (
          <div className="flex flex-col items-center animate-fade-in-up">
            <img 
              src={generatedUser.avatarUrl} 
              alt="Generated Avatar" 
              className="w-32 h-32 rounded-full mb-4 border-4 border-cyan-500 shadow-lg shadow-cyan-500/30" 
            />
            <h2 className="text-3xl font-semibold text-white">{generatedUser.username}</h2>
            <p className="text-gray-400 mb-8">This is you.</p>
            <button 
              onClick={() => onLoginSuccess(generatedUser)} 
              className="w-full bg-fuchsia-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-fuchsia-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-opacity-75"
            >
              Start Chatting
            </button>
          </div>
        )}

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;
