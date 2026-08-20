import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
function AIThinkingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ambient glow */}
      <div className="ai-glow ai-glow-1" />
      <div className="ai-glow ai-glow-2" />

      {/* AI network lines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="aiLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        <path
          className="ai-path ai-path-1"
          d="M80 180 C260 60 360 300 520 190"
          stroke="url(#aiLine)"
          strokeWidth="1"
          fill="none"
        />

        <path
          className="ai-path ai-path-2"
          d="M950 160 C1120 80 1230 260 1400 150"
          stroke="url(#aiLine)"
          strokeWidth="1"
          fill="none"
        />

        <path
          className="ai-path ai-path-3"
          d="M40 700 C230 570 350 810 530 680"
          stroke="url(#aiLine)"
          strokeWidth="1"
          fill="none"
        />

        <path
          className="ai-path ai-path-4"
          d="M930 690 C1100 550 1260 790 1430 650"
          stroke="url(#aiLine)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Floating AI nodes */}
      <div className="ai-node ai-node-1">
        <span />
      </div>

      <div className="ai-node ai-node-2">
        <span />
      </div>

      <div className="ai-node ai-node-3">
        <span />
      </div>

      <div className="ai-node ai-node-4">
        <span />
      </div>

      <div className="ai-node ai-node-5">
        <span />
      </div>

      <div className="ai-node ai-node-6">
        <span />
      </div>

      {/* Thinking AI */}
      <div className="ai-thinking">
        <div className="ai-thinking-orbit ai-thinking-orbit-1" />
        <div className="ai-thinking-orbit ai-thinking-orbit-2" />

        <div className="ai-thinking-core">M</div>

        <div className="ai-thinking-dot ai-thinking-dot-1" />
        <div className="ai-thinking-dot ai-thinking-dot-2" />
        <div className="ai-thinking-dot ai-thinking-dot-3" />
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to create account.");
      }

      navigate("/verify-email", {
        state: {
          email,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    h-13 w-full
    rounded-xl
    border border-[#2A3142]
    bg-[#0D1321]/70
    pl-12 pr-12
    py-3.5
    text-sm text-white
    outline-none
    transition
    placeholder:text-[#667085]
    focus:border-[#8B5CF6]
    focus:ring-2
    focus:ring-[#7C3AED]/10
  `;

  return (
    <div
      className="
        relative min-h-screen
        overflow-hidden
        bg-[#070B14]
        px-4 py-8
        flex items-center justify-center
      "
    >
      <AIThinkingBackground />
      {/* Glow */}
      <div
        className="
          pointer-events-none absolute
          -left-32 top-1/4
          h-[420px] w-[420px]
          rounded-full
          bg-[#7C3AED]/10
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none absolute
          -right-32 bottom-0
          h-[420px] w-[420px]
          rounded-full
          bg-[#5B4CFF]/10
          blur-[120px]
        "
      />

      <div
        className="
          relative z-10
          w-full max-w-[480px]
          rounded-[28px]
          border border-[#8B5CF6]/30
          bg-[#111625]/75
          px-6 py-7
          shadow-[0_30px_80px_rgba(0,0,0,0.45)]
          backdrop-blur-xl
          sm:px-10 sm:py-8
        "
      >
        {/* Logo */}
        <div className="mb-5 text-center">
          <div
            className="
              relative mx-auto mb-3
              flex h-16 w-16
              items-center justify-center
              rounded-full
              border border-[#8B5CF6]/50
              bg-[#7C3AED]/10
              shadow-[0_0_35px_rgba(124,58,237,0.18)]
            "
          >
            <span
              className="
                bg-gradient-to-br
                from-[#C084FC]
                via-[#A855F7]
                to-[#5B4CFF]
                bg-clip-text
                text-3xl font-bold
                text-transparent
              "
            >
              M
            </span>

            <span
              className="
                absolute right-2 top-2
                h-2 w-2
                rounded-full
                bg-[#A855F7]
                shadow-[0_0_12px_#A855F7]
              "
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Mak-
            <span
              className="
                bg-gradient-to-r
                from-[#A855F7]
                to-[#6366F1]
                bg-clip-text
                text-transparent
              "
            >
              AI
            </span>
          </h1>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Your AI Assistant for Everything
          </p>
        </div>

        {/* Tabs */}
        <div
          className="
            mb-5 grid grid-cols-2
            border-b border-[#2A3142]
          "
        >
          <Link
            to="/login"
            className="
              py-3 text-center
              text-sm text-[#8D96A8]
              transition
              hover:text-white
            "
          >
            Login
          </Link>

          <div
            className="
              relative py-3
              text-center text-sm
              font-medium text-white
            "
          >
            Create Account
            <span
              className="
                absolute bottom-[-1px]
                left-0 right-0
                h-[2px]
                bg-gradient-to-r
                from-[#7C3AED]
                via-[#A855F7]
                to-[#5B4CFF]
              "
            />
          </div>
        </div>

        {error && (
          <div
            className="
              mb-4 rounded-xl
              border border-red-500/20
              bg-red-500/10
              px-4 py-3
              text-sm text-red-300
            "
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div className="relative">
            <User
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-[#7D8799]
              "
            />

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-[#7D8799]
              "
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockKeyhole
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-[#7D8799]
              "
            />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={8}
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="
                absolute right-4 top-1/2
                -translate-y-1/2
                text-[#7D8799]
                hover:text-white
              "
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm */}
          <div className="relative">
            <LockKeyhole
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-[#7D8799]
              "
            />

            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              minLength={8}
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="
                absolute right-4 top-1/2
                -translate-y-1/2
                text-[#7D8799]
                hover:text-white
              "
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="px-1 text-[11px] text-[#6F788A]">
            Password must contain at least 8 characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="
              mt-2 w-full
              rounded-xl
              bg-gradient-to-r
              from-[#6D28D9]
              via-[#7C3AED]
              to-[#4F46E5]
              px-4 py-3.5
              text-sm font-semibold
              text-white
              shadow-[0_8px_30px_rgba(124,58,237,0.22)]
              transition-all duration-200
              hover:-translate-y-[1px]
              hover:shadow-[0_10px_35px_rgba(124,58,237,0.32)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p
            className="
              pt-3 text-center
              text-sm text-[#8D96A8]
            "
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="
                font-medium
                text-[#A855F7]
                hover:text-[#C084FC]
              "
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
