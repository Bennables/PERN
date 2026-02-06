import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router";

const OrgFind = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const link = import.meta.env.VITE_LINK;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your organization name");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${link}/org/find`, {
        params: { name: trimmed },
      });

      // Persist selected org for later pages (login/register)
      sessionStorage.setItem("orgId", String(res.data.org.ID));
      sessionStorage.setItem("orgName", res.data.org.name);

      nav("/login");
    } catch (err) {
      console.error("Error finding org:", err?.response?.data?.message || err.message);
      if (err.response?.status === 404) {
        setError("Organization not found. Check the name or create a new one.");
      } else {
        setError(err.response?.data?.message || "Failed to find organization");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4m-6 6v-2m0 2a2 2 0 100-4m0 4a2 2 0 110-4"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Find your organization</h2>
            <p className="text-sm text-gray-600 mt-2">Enter your org name to continue to login.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization name
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product Squad Alpha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg"
            >
              {loading ? "Searching..." : "Continue"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Need an account?{" "}
              <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Create one
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Don&apos;t have an org yet?{" "}
              <Link to="/org/create" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Create org
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              You can also continue without an org, but team features won&apos;t work.
            </p>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("orgId");
                sessionStorage.removeItem("orgName");
                nav("/login");
              }}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgFind;

