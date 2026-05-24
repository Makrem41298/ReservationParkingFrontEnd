import { useState, useRef, useEffect } from 'react';
import { reclamationsAPI } from '../features/reclamations/reclamationsAPI';
import { MODE_RESPONSE } from '../constants/roles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ClientChatbot({ isAnonymous = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'IAMessage',
      message:
        "👋 Hello! I'm your ParkEase AI assistant. How can I help you today? Feel free to ask about parking, reservations, subscriptions, or anything else!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const prevIsAnonymous = useRef(isAnonymous);

  useEffect(() => {
    if (!prevIsAnonymous.current && isAnonymous) {
      // User logged out: reset messages and clear sessionId
      setMessages([
        {
          sender: 'IAMessage',
          message:
            "👋 Hello! I'm your ParkEase AI assistant. How can I help you today? Feel free to ask about parking, reservations, subscriptions, or anything else!",
        },
      ]);
      sessionStorage.removeItem("sessionId");
    }
    prevIsAnonymous.current = isAnonymous;
  }, [isAnonymous]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'HumanMessage', message: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const apiCall = isAnonymous
        ? reclamationsAPI.sendMessageAnonymousAgent
        : reclamationsAPI.sendMessageClientAgent;

      let sessionId = sessionStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("sessionId", sessionId);
      }

      const response = await apiCall({
        question: userMessage,
        modeResponse: MODE_RESPONSE.GENERAL_RESPONSE,
        sessionId: sessionId,
      });

      const answer = response.data.answer;
      setMessages((prev) => [...prev, { sender: 'IAMessage', message: answer }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'IAMessage',
          message: '❌ Sorry, something went wrong. Please try again later.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        sender: 'IAMessage',
        message:
          "👋 Hello! I'm your ParkEase AI assistant. How can I help you today? Feel free to ask about parking, reservations, subscriptions, or anything else!",
      },
    ]);
    const newSessionId = crypto.randomUUID();
    sessionStorage.setItem("sessionId", newSessionId);
    setInput('');
  };

  return (
    <>
      {/* Chat Window — anchored at bottom-right, same position as the button */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col bg-dark-900 rounded-2xl shadow-2xl border border-dark-700 overflow-hidden"
          style={{ width: '380px', height: 'min(520px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg shadow-lg">
                ✨
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">ParkEase Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-white/70 text-xs">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                title="New Chat"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer mr-1 flex items-center gap-1 text-xs bg-white/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'HumanMessage' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'IAMessage' && (
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center text-xs mr-2 shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'HumanMessage'
                      ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-dark-800 text-dark-100 rounded-2xl rounded-tl-sm border border-dark-700'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className={`mb-1 last:mb-0 text-sm leading-relaxed ${msg.sender === 'HumanMessage' ? 'text-white' : 'text-dark-100'}`}>
                          {children}
                        </p>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-400 underline hover:text-accent-300">
                          {children}
                        </a>
                      ),
                      ul: ({ children }) => <ul className="list-disc list-inside ml-2 mb-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside ml-2 mb-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm mb-0.5">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: ({ children }) => (
                        <code className="bg-dark-700 px-1.5 py-0.5 rounded text-xs font-mono text-accent-300">{children}</code>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-auto my-2">
                          <table className="w-auto text-xs border border-dark-600 border-collapse">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-dark-700 text-xs">{children}</thead>
                      ),
                      tr: ({ children }) => (
                        <tr className="border-b border-dark-600">{children}</tr>
                      ),
                      th: ({ children }) => (
                        <th className="border border-dark-600 px-2 py-1 text-left font-medium text-dark-100 whitespace-nowrap">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-dark-600 px-2 py-1 text-dark-200 whitespace-nowrap">{children}</td>
                      ),
                    }}
                  >
                    {msg.message}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-accent-500/20 flex items-center justify-center text-xs mr-2 shrink-0 mt-1">
                  🤖
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-dark-800 border-t border-dark-700 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-400 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition"
              placeholder="Type your question..."
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-xl disabled:opacity-40 transition shadow-lg shadow-primary-600/20 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* FAB Button — only visible when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 hover:scale-110"
          style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.4), 0 8px 30px rgba(0, 0, 0, 0.3)' }}
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </>
  );
}
