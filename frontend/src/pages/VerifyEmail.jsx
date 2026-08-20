import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedCode = [...code];
    updatedCode[index] = digit;

    setCode(updatedCode);
    setError("");

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) {
      return;
    }

    const updatedCode = [...pasted.split(""), ...Array(6).fill("")].slice(0, 6);

    setCode(updatedCode);

    const nextIndex = Math.min(pasted.length, 5);

    inputs.current[nextIndex]?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Verification failed.");
      }

      setMessage("Email verified successfully.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            verified: true,
          },
        });
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) {
      return;
    }

    setError("");
    setMessage("");

    try {
      setResending(true);

      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to resend code.");
      }

      setMessage("A new verification code has been sent.");

      setCode(["", "", "", "", "", ""]);
      setCountdown(60);

      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">IMAC-AI</h1>

          <p className="text-gray-400 mt-2">Verify your email</p>
        </div>

        <div className="bg-[#181818] border border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-7">
            <h2 className="text-xl font-semibold text-white">
              Check your inbox
            </h2>

            <p className="text-sm text-gray-400 mt-3">
              We sent a 6-digit verification code to
            </p>

            <p className="text-sm text-white mt-1">{email}</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-lg border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div
              className="flex justify-center gap-2 mb-7"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className="w-12 h-14 bg-[#111111] border border-gray-700 rounded-lg text-center text-xl font-semibold text-white outline-none focus:border-white"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">Didn't receive the code?</p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm text-white mt-2 hover:underline disabled:text-gray-600 disabled:no-underline"
            >
              {resending
                ? "Sending..."
                : countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend code"}
            </button>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <Link
              to="/register"
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Use a different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
