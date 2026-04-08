import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { reclamationsAPI } from '../reclamationsAPI';

export default function ReclamationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [reclamation, setReclamation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin Reply State
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('RESOLVED');
  const [replyLoading, setReplyLoading] = useState(false);

  // Client Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { role: 'agent', text: "Hello! I am your AI assistant. Need help crafting a reply for this reclamation?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const fetchReclamation = async () => {
    try {
      setLoading(true);
      const res = await reclamationsAPI.getById(id);
      setReclamation(res.data);
      setReplyText(res.data.solution || '');
      setStatus(res.data.status || 'RESOLVED');
      setEditContent(res.data.content || '');
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reclamation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamation();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendReply = async () => {
    if (!replyText) return;
    try {
      setReplyLoading(true);
      await reclamationsAPI.update(id, {
        solution: replyText,
        status: status,
      });
      navigate('/reclamations');
    } catch (err) {
      console.error(err);
      alert('Error updating reclamation');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEditContent = async () => {
    if (!editContent.trim()) return;
    try {
      setEditLoading(true);
      await reclamationsAPI.update(id, { content: editContent });
      setReclamation(prev => ({ ...prev, content: editContent }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Error updating reclamation content');
    } finally {
      setEditLoading(false);
    }
  };

  const handleGenerateAIReply = () => {
    // Static ai generation fallback
    setReplyText(`Hello ${reclamation?.client?.firstName || 'User'},\n\nWe apologize for the inconvenience you experienced with: "${reclamation?.subject}".\nThe problem has been reported and resolved by our technical team.\n\nThank you for choosing ParkEase.\n\nBest Regards,\nSupport Team`);
  };

  const handleAgentChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add Admin's msg
    const newChat = [...chatMessages, { role: 'admin', text: chatInput }];
    setChatMessages(newChat);
    setChatInput('');

    // Simulate Agent response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'agent', 
          text: `Here is a suggested reply:\n\nHello ${reclamation?.client?.firstName || 'User'},\nWe apologize for this incident regarding "${reclamation?.subject}". We have checked the system and resolved the barrier issue. Let us know if you still face any problems.\n\nRegards,\nSupport Team`
        }
      ]);
    }, 1000);
  };

  const copyToReply = (text) => {
    setReplyText(text);
  };

  if (loading) return <div className="p-8 text-center text-dark-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-danger-500">{error}</div>;
  if (!reclamation) return <div className="p-8 text-center text-dark-500">Reclamation not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* LEFT PANE: Reclamation Details & Official Reply */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden ${!isAdmin ? 'lg:flex-none lg:w-full max-w-4xl mx-auto' : ''}`}>
        {/* Header */}
        <div className="p-6 border-b border-dark-100 flex items-center justify-between bg-dark-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reclamations')}
              className="p-2 border border-dark-200 rounded-lg hover:bg-dark-100 text-dark-600"
              title="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-dark-900">Reclamation #{reclamation.id}</h2>
              <p className="text-sm text-dark-500 mt-0.5">
                From: {reclamation.client?.firstName} {reclamation.client?.lastName}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border ${
            reclamation.status === 'RESOLVED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : reclamation.status === 'IN_PROGRESS'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : reclamation.status === 'REJECTED'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              reclamation.status === 'RESOLVED' ? 'bg-emerald-500' :
              reclamation.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' :
              reclamation.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-500'
            }`}></span>
            {reclamation.status === 'IN_PROGRESS' ? 'In Progress' : 
             reclamation.status === 'RESOLVED' ? 'Resolved' : 
             reclamation.status === 'REJECTED' ? 'Rejected' : reclamation.status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-dark-50 p-5 rounded-xl border border-dark-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-dark-900">Subject: {reclamation.subject}</h3>
              {!isAdmin && reclamation.status === 'IN_PROGRESS' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Edit Description
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3 mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-white border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setIsEditing(false); setEditContent(reclamation.content); }}
                    className="px-3 py-1.5 text-xs font-medium text-dark-600 hover:bg-dark-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditContent}
                    disabled={editLoading || !editContent.trim() || editContent === reclamation.content}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-dark-700 whitespace-pre-wrap leading-relaxed">{reclamation.content}</p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-bold text-dark-900 border-b border-dark-100 pb-2">
              {isAdmin ? 'Official Solution (Champ Reply)' : 'Admin Solution'}
            </h4>
            
            {isAdmin ? (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full p-4 pb-14 bg-white border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition resize-y"
                    placeholder="Type the official reply to the client here..."
                  />
                  <button
                    onClick={handleGenerateAIReply}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-100 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    ✨ Generate reply by agent
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-dark-700">Set Status:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-4 py-2 bg-white border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleSendReply}
                    disabled={replyLoading}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/30 transition disabled:opacity-50"
                  >
                    {replyLoading ? 'Saving...' : 'Send Official Reply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-xl border border-dark-200 shadow-sm">
                <p className="text-dark-700 whitespace-pre-wrap">
                  {reclamation.solution || <span className="italic text-dark-400">No solution provided yet...</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Agent Sidebar (Admins Only) */}
      {isAdmin && (
        <div className="w-full lg:w-[400px] flex flex-col bg-dark-900 rounded-2xl shadow-xl overflow-hidden border border-dark-800 shrink-0">
          <div className="p-4 bg-dark-800 border-b border-dark-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold shadow-lg shadow-accent-500/30">
                ✨
              </div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'admin' 
                      ? 'bg-primary-600 text-white rounded-tr-sm' 
                      : 'bg-dark-800 text-dark-100 rounded-tl-sm border border-dark-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                {msg.role === 'agent' && (
                  <button
                    onClick={() => copyToReply(msg.text)}
                    className="mt-1 text-xs text-accent-400 hover:text-accent-300 font-medium px-1 flex items-center gap-1 transition"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy to solution
                  </button>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleAgentChat} className="p-3 bg-dark-800 border-t border-dark-700 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition"
              placeholder="Ask agent for a reply..."
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="bg-accent-600 text-white px-4 py-2.5 rounded-xl hover:bg-accent-500 disabled:opacity-50 transition shadow-lg shadow-accent-600/20"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
