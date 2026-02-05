import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatarBg?: string;
  initials: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  avatarBg = 'from-emerald-500 to-green-500',
  initials,
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-emerald-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="flex items-center mb-6">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{quote}</p>
      <div className="flex items-center">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${avatarBg} rounded-full flex items-center justify-center mr-4`}
          aria-hidden="true"
        >
          <span className="text-white font-semibold">{initials}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};
