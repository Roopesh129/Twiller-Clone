"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axiosInstance";

interface LoginRecord {
  browser: string;
  os: string;
  deviceCategory: string;
  ipAddress: string;
  loginTimestamp: string;
}

export default function LoginHistoryTable({ userEmail }: { userEmail: string }) {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userEmail) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/auth/login-history", {
          params: { email: userEmail },
        });
        setHistory(res.data || []);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to load session history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userEmail]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading session history...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!history.length) {
    return <div className="p-4 text-center text-gray-500">No session history found.</div>;
  }

  return (
    <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs uppercase font-semibold">
          <tr>
            <th className="px-4 py-3">Device Category</th>
            <th className="px-4 py-3">Browser</th>
            <th className="px-4 py-3">Operating System</th>
            <th className="px-4 py-3">IP Address</th>
            <th className="px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {history.map((record, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-3 capitalize font-medium">
                {record.deviceCategory === "mobile" ? "📱 Mobile" : "💻 Desktop"}
              </td>
              <td className="px-4 py-3">{record.browser}</td>
              <td className="px-4 py-3">{record.os}</td>
              <td className="px-4 py-3 font-mono text-xs">{record.ipAddress}</td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(record.loginTimestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}