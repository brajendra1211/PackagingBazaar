import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Search, 
  RefreshCcw,
  MessageSquare,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { fetchAllContactMessages, updateContactMessageStatus } from "../../services/contactServices";
import { useNotification } from "../../context/NotificationContext";

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    subject: ""
  });
  const { notifyError, notifySuccess } = useNotification();

  // Get unique subjects for filters
  const subjects = [...new Set(messages.map(m => m.subject))].filter(Boolean);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetchAllContactMessages();
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      notifyError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch = (
      item.name?.toLowerCase().includes(s) ||
      item.email?.toLowerCase().includes(s) ||
      item.company_name?.toLowerCase().includes(s) ||
      item.subject?.toLowerCase().includes(s)
    );

    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesSubject = !filters.subject || item.subject === filters.subject;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateContactMessageStatus(id, newStatus);
      if (res.success) {
        notifySuccess("Status updated!");
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch (err) {
      notifyError("Failed to update status");
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 min-h-[400px]">
        <RefreshCcw className="animate-spin text-accent mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <Mail size={24} />
            </div>
            <h1 className="font-syne font-black text-3xl text-gray-900 uppercase tracking-tight">
              Contact Inquiries
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Managing messages from the public contact form.</p>
        </div>
      </div>

      {/* Filter & Search Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full mb-8">
        {/* Filters on Left */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm">
          <div className="pl-3 pr-1 text-gray-400">
            <Filter size={16} />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none py-2 pr-4 cursor-pointer"
          >
            <option value="">Any Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
          <div className="w-px h-4 bg-gray-100" />
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none py-2 pr-4 cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>

          {(filters.status || filters.subject) && (
            <button 
              onClick={() => setFilters({ status: "", subject: "" })}
              className="text-[10px] font-black uppercase text-accent hover:underline px-3 border-l border-gray-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search on Right */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative group w-full xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm w-full outline-none focus:border-accent shadow-sm"
            />
          </div>
          <button 
            onClick={loadMessages}
            className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-accent transition-colors shadow-sm"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Sender Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Inquiry Type</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Message Content</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <MessageSquare size={48} className="opacity-20" />
                      <p className="font-syne font-black text-lg uppercase tracking-wide">No Messages Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900">{msg.name}</div>
                      <div className="text-xs text-gray-500">{msg.email}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                        {msg.company_name || "Personal Inquiry"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-black uppercase rounded-full border border-accent/10">
                        {msg.subject || "General"}
                      </span>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-3">
                        "{msg.message}"
                      </p>
                      <div className="text-[10px] text-gray-400 mt-1">Phone: {msg.phone || 'N/A'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={msg.status}
                        onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none transition-colors ${
                          msg.status === 'pending' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
