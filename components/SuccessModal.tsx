"use client";

import React from 'react';
import { Check, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-[380px] bg-white rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full text-gray-300 hover:bg-gray-50 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100/50">
          <div className="w-12 h-12 bg-[#2D4F53] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#2D4F53]/30">
            <Check size={28} strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-[20px] font-black text-[#1E1E1E] mb-2">{title}</h3>
        <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-8">
          {message}
        </p>

        {/* Button */}
        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#2D4F53] text-white font-bold rounded-2xl hover:bg-[#233e41] transition-all active:scale-95 shadow-lg shadow-[#2D4F53]/20"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
