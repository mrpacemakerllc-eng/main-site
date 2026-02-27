'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Signup {
  email: string;
  timestamp: string;
}

export default function AdminSignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (authenticated) {
      const stored = localStorage.getItem('ecg-vault-signups');
      if (stored) {
        setSignups(JSON.parse(stored));
      }
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password protection - change this password!
    if (password === 'mrpacemaker2025') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const exportCSV = () => {
    const csv = 'Email,Signup Date\n' + signups.map(s =>
      `${s.email},${new Date(s.timestamp).toLocaleString()}`
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecg-vault-signups-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">ECG Library Signups</h1>
          <Link href="/" className="text-blue-600 hover:underline">Back to Site</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Signups</h2>
              <p className="text-gray-600">{signups.length} total signups</p>
            </div>
            <button
              onClick={exportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>

          {signups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No signups yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((signup, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900">{signup.email}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(signup.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Signups are stored in browser localStorage. To persist signups across devices,
            integrate with a database (Supabase, Firebase, etc.) or email service (Mailchimp, ConvertKit).
          </p>
        </div>
      </main>
    </div>
  );
}
