import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import dixelsLogo from 'figma:asset/247d65801bbc3aad30cb75db0c08362c2b40b62f.png';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('sara.ahmed@company.com');
  const [password, setPassword] = useState('demo');
  const [pending, setPending] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    window.setTimeout(onLogin, 620);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-nt-0">
      <div className="dx-aurora" aria-hidden="true" />
      <div className="absolute inset-0 dx-grid-texture" aria-hidden="true" />

      <main className="relative flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.8, 0.25, 1] }}
          className="w-full max-w-[26rem]"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <img src={dixelsLogo} alt="Dixels" className="mb-6 h-11 w-auto object-contain" />
            <p className="dx-eyebrow mb-3">The agentic experience OS</p>
            <h1 className="dx-h2 text-balance">Welcome back.</h1>
            <p className="mt-3 max-w-[22rem] text-body text-ink-muted">
              Your spaces, services and people — connected in one place.
            </p>
          </div>

          <div className="dx-card p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor={emailId} className="block text-[0.8125rem] font-medium text-ink">
                  Work email
                </label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="dx-field"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={passwordId} className="block text-[0.8125rem] font-medium text-ink">
                  Password
                </label>
                <input
                  id={passwordId}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="dx-field"
                />
              </div>

              <button type="submit" disabled={pending} className="dx-btn-primary w-full">
                {pending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    Signing you in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[0.75rem] text-ink-subtle">
            Demo environment · any credentials will do
          </p>
        </motion.div>
      </main>
    </div>
  );
}
