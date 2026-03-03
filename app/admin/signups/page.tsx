import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminQuizLeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = session.user as any;
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const leads = await prisma.quizLead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quiz Leads</h1>
          <div className="flex gap-4 items-center">
            <Link href="/admin" className="text-blue-600 hover:underline">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Email Leads from Quiz</h2>
              <p className="text-gray-500 text-sm">{leads.length} total leads</p>
            </div>
          </div>

          {leads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quiz leads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.score !== null && lead.total !== null
                          ? `${lead.score}/${lead.total}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.source || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
