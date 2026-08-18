import KinCharacter from '@/components/ui/KinCharacter';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayoutWrapper({ children, title, subtitle }: AuthLayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex">
      {/* Left side — Kin character + branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-[rgba(0,0,0,0.06)] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(45, 95, 138, 0.06), transparent 60%)',
          }}
        />
        
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 inline-block">
            <KinCharacter size={140} state="idle" />
          </div>
          
          <h2 className="text-[28px] font-bold tracking-tight text-[#1A1A1E] mb-3">
            Meet Kin
          </h2>
          <p className="text-[15px] text-[#5A5D6B] leading-[1.7]">
            Your penguin AI companion who quietly watches websites 
            and tells you when something meaningful changes.
          </p>
          
          <div className="mt-10 space-y-4 text-left">
            {[
              { title: 'Plain English alerts', desc: 'No technical diffs. Just clear explanations.' },
              { title: 'Your data stays private', desc: 'Separate collectors. Separate users. Always.' },
              { title: 'Build scrapers with words', desc: 'Describe it. Kin builds it automatically.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-[12px] bg-[#FAFAF7] border border-[rgba(0,0,0,0.04)]">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[13px] font-bold"
                  style={{ background: '#2D5F8A' }}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-[#1A1A1E]">{item.title}</div>
                  <div className="text-[12.5px] text-[#5A5D6B] mt-[2px]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <KinCharacter size={32} animate={false} showShadow={false} />
            <span className="font-bold text-[18px] tracking-tight">Kin</span>
          </div>

          <h1 className="text-[26px] font-bold tracking-tight text-[#1A1A1E] mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-[#5A5D6B] mb-8">{subtitle}</p>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
