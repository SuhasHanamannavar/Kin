import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6">
      <SignIn 
        path="/auth/sign-in"
        routing="path"
        signUpUrl="/auth/sign-up"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-[420px]',
            card: 'shadow-none border border-[rgba(0,0,0,0.08)] rounded-[16px] bg-white',
            headerTitle: 'text-[22px] font-bold tracking-tight text-[#1A1A1E]',
            headerSubtitle: 'text-[14px] text-[#5A5D6B]',
            socialButtonsBlockButton: 'border border-[rgba(0,0,0,0.12)] rounded-[10px] bg-white text-[#1A1A1E] font-semibold text-[14px] hover:bg-[rgba(0,0,0,0.02)]',
            formButtonPrimary: 'bg-[#1A1A1E] text-white hover:bg-[#2A2A3A] rounded-[10px] font-semibold text-[14px]',
            formFieldInput: 'border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)]',
            formFieldLabel: 'text-[12.5px] font-semibold text-[#5A5D6B]',
            footerActionLink: 'text-[#2D5F8A] font-medium hover:underline',
            identityPreviewText: 'text-[14px] text-[#1A1A1E]',
          },
        }}
      />
    </div>
  );
}
