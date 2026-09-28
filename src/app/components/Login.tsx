import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Lock, Mail } from 'lucide-react';
import dixelsLogo from 'figma:asset/247d65801bbc3aad30cb75db0c08362c2b40b62f.png';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center mb-2">
              <img src={dixelsLogo} alt="Dixels" className="h-16 w-auto object-contain" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-slate-900">Welcome to Dixels</CardTitle>
              <CardDescription className="text-slate-500">
                Sign in to your workplace super app
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-9 bg-white" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-9 bg-white" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#5B21B6] hover:bg-purple-800 text-white font-medium py-2 shadow-lg shadow-[#5B21B6]/30"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Demo environment. Use any credentials to access.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
