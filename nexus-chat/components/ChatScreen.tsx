
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, MessageSender } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { startChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatScreenProps {
  user: User;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(() => {
    chatRef.current = startChat(user.username);
    setMessages([
      {
        id: 'welcome-1',
        text: `Welcome, ${user.username}! Your generative identity is online.`,
        sender: MessageSender.BOT
      },
      {
        id: 'welcome-2',
        text: 'You can start chatting with your AI friend now. Say hi!',
        sender: MessageSender.BOT
      }
    ]);
  }, [user.username]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);


  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: MessageSender.USER,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (chatRef.current) {
        const response = await chatRef.current.sendMessage({ message: text });
        const botMessage: Message = {
          id: Date.now().toString() + '-bot',
          text: response.text,
          sender: MessageSender.BOT,
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: MessageSender.BOT,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="flex items-center p-4 bg-gray-800/70 backdrop-blur-sm border-b border-gray-700 shadow-lg z-10">
        <img src={user.avatarUrl} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-cyan-400" />
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-white">{user.username}</h2>
          <p className="text-sm text-green-400">Online</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatScreen;
