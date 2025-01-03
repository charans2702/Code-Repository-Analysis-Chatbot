import { useState, useEffect, useRef } from 'react';
import { Github, Send, Loader2, Moon, Sun, MessageCircle, Bot } from 'lucide-react';

const ChatApp = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  const checkStatus = async () => {
    const response = await fetch('http://localhost:8000/status');
    const data = await response.json();
    setInitialized(data.initialized);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const initializeRepo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl })
      });
      if (!response.ok) throw new Error('Failed to initialize repository');
      await checkStatus();
      setRepoUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Generating...', isLoading: true }]);
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      const data = await response.json();
      setMessages(prev => prev.slice(0, -1).concat({ role: 'assistant', content: data.answer }));
    } catch (err) {
      setError('Failed to get response');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${
      darkMode ? 'from-gray-900 via-gray-800 to-gray-900' : 'from-blue-50 via-white to-indigo-50'
    }`}>
      <header className={`flex-none p-4 backdrop-blur-sm bg-opacity-90 ${
        darkMode ? 'bg-gray-800/70' : 'bg-white/70'
      } border-b border-opacity-50 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
              <MessageCircle className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h1 className={`text-xl font-bold bg-gradient-to-r ${
              darkMode ? 'from-blue-400 to-indigo-400' : 'from-blue-600 to-indigo-600'
            } bg-clip-text text-transparent`}>
              Repository Chat Assistant
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full transition-all duration-300 hover:scale-110"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!initialized ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
              darkMode ? 'bg-gray-800/90' : 'bg-white/90'
            } backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Github className="h-8 w-8 text-white" />
                </div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Initialize Repository
                </h2>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <button
                  onClick={initializeRepo}
                  disabled={loading || !repoUrl}
                  className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Initialize Repository'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={chatBoxRef} className="flex-1 overflow-y-auto">
              <div className="px-4 py-6 space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-6 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                        : `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`
                    }`}>
                      {msg.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <span>{msg.content}</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                        U
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex-none border-t ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              {error && (
                <div className="p-4 bg-red-100 border-2 border-red-300 text-red-700">
                  {error}
                </div>
              )}
              <div className="p-4 max-w-5xl mx-auto flex gap-3">
                <input
                  type="text"
                  placeholder="Ask about the repository..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input}
                  className="px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-5 w-5" />
                      <span>Send</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatApp;