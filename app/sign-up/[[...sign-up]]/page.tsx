import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Únete a <span className="text-purple-600">MastIdea</span>
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta y empieza a capturar tus ideas
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl"
            }
          }}
        />
      </div>
    </div>
  );
}
