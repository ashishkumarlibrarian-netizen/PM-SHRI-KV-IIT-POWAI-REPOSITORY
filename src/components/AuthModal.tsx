import React, { useState } from "react";
import { X, User, Mail, Lock, RefreshCw, AlertCircle, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";
import { User as UserType } from "../types";
import { motion } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { usernameOrEmail: username || email, password }
      : { email, username, password, fullName };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccessMsg(data.message || "Operation successful!");
      
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
        // Reset form
        setEmail("");
        setUsername("");
        setPassword("");
        setFullName("");
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        id="auth-modal-content"
        className="w-full max-w-md bg-white dark:bg-slate-900 text-indigo-950 dark:text-slate-100 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden relative"
      >
        {/* Top banner accent */}
        <div className="h-2.5 bg-gradient-to-r from-amber-500 via-red-800 to-indigo-900 w-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="auth-modal-close"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 space-y-6">
          {/* Header section */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-slate-900 text-lg shadow-inner mx-auto border border-amber-400">
              KV
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLogin ? "Student Desk Login" : "Register New Account"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-normal">
              {isLogin 
                ? "Enter your credentials to access your PM Shri KV library profile"
                : "Join PM Shri KV IIT Powai Library Hub as a registered scholar"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Alerts */}
            {error && (
              <div id="auth-error-alert" className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div id="auth-success-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Registration specific fields */}
            {!isLogin && (
              <div className="space-y-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-indigo-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. Aditi Krishnan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email field for register, or simple username/email for login */}
            {isLogin ? (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Username or Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-indigo-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter your email or username"
                    value={username || email}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setEmail(e.target.value);
                    }}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-indigo-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-indigo-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-indigo-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-xl tracking-wide transition-colors flex items-center justify-center gap-2 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : isLogin ? (
                "Log In"
              ) : (
                "Create Student Account"
              )}
            </button>
          </form>

          {/* Toggle View Link */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-indigo-900 dark:text-amber-400 hover:text-red-800 dark:hover:text-amber-300 font-semibold underline underline-offset-4 transition-colors"
            >
              {isLogin 
                ? "First time scholar? Register here" 
                : "Already have an account? Log In"
              }
            </button>
          </div>

          {/* Guest path notice display */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive stories & simulated buzz require authentication.</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
