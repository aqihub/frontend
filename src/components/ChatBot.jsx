import React, { useState, useRef, useEffect } from 'react';

const ChatBot = ({ isDarkMode, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! How can I help you with air quality information today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://qwen72b.gaia.domains/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen72b',
          messages: [
            { role: 'system', content: 'You are a helpful assistant specializing in air quality information and environmental data.' },
            { role: 'user', content: inputMessage }
          ]
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.choices[0].message.content }]);
    } catch (error) {
        console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
    }

    setIsLoading(false);
    setInputMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-24 bottom-36 z-[1001] w-96 rounded-xl shadow-2xl">
      {/* Chat Container */}
      <div className={`flex flex-col h-[500px] ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-xl overflow-hidden border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        } border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${
                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>AQI Assistant</h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Powered by Qwen-72B</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user' 
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-200' 
                    : 'bg-white text-gray-800'
              } ${message.type === 'bot' ? 'shadow-sm' : ''}`}>
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-lg px-4 py-2 ${
                isDarkMode ? 'bg-gray-700' : 'bg-white'
              }`}>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className={`flex-1 px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-200' 
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 py-2 rounded-lg ${
                isLoading || !inputMessage.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors duration-200`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 