import React from 'react';

interface SubPageProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SubPage({ 
  title = '서브 페이지', 
  subtitle = 'Sub Page', 
  children 
}: SubPageProps) {
  return (
    <>
      {/* Sub Title Section */}
      <section className="relative h-[300px] bg-[#F5FDE7] flex items-center justify-center overflow-hidden">
        {/* Gradient Circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-70 top-[-50px] left-[10%] animate-float-1 bg-gradient-radial from-[#A8E6A3] via-[#7DD87A] to-[rgba(125,216,122,0.3)]"></div>
          <div className="absolute w-[150px] h-[150px] rounded-full blur-[80px] opacity-70 top-[50px] right-[15%] animate-float-2 bg-gradient-radial from-[#D4E157] via-[#C0CA33] to-[rgba(192,202,51,0.3)]"></div>
          <div className="absolute w-[180px] h-[180px] rounded-full blur-[80px] opacity-70 bottom-[-30px] left-1/2 transform -translate-x-1/2 animate-float-3 bg-gradient-radial from-[#B2DFDB] via-[#80CBC4] to-[rgba(128,203,196,0.3)]"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto p-8">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.9); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
          50% { transform: translateX(-50%) translateY(-25px) scale(1.05); }
        }
        
        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 10s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float-3 12s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
        }
      `}</style>
    </>
  );
}