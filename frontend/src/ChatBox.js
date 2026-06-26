import React, { useState, useRef, useEffect } from 'react';

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Namaste! 👋 Type your symptoms or health question. I'll reply with Ayurvedic guidance and a wellness routine." }
  ]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const messagesEndRef = useRef(null);

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send user message and get bot response from backend
  const sendMessage = async (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    setWaiting(true);
    
    try {
      const response = await fetch('/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();

      if (data.advice) {
        setMessages(prev => [...prev, { from: 'bot', text: data.advice }]);
      } else if (data.reply) {
        setMessages(prev => [...prev, { from: 'bot', text: data.reply }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, I could not understand that. Please try again.' }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, something went wrong. Please try again later.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Unable to connect to the server. Please try again later.' }]);
    }
    
    setWaiting(false);
  };

  // Handle form submit or Enter key press
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || waiting) return;
    sendMessage(input.trim());
  };

  // Toggle chat open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: isMobile ? '20px' : '30px',
          right: isMobile ? '20px' : '30px',
          width: isMobile ? '56px' : '64px',
          height: isMobile ? '56px' : '64px',
          borderRadius: '50%',
          backgroundColor: '#3da34d',
          color: 'white',
          border: 'none',
          fontSize: isMobile ? '28px' : '32px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(61, 163, 77, 0.4)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          fontFamily: 'Arial'
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#2d8a3c';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#3da34d';
          }
        }}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      <div
        style={{
          position: 'fixed',
          bottom: isOpen ? '0' : '-100%',
          right: isMobile ? '0' : '30px',
          width: isMobile ? '100%' : '360px',
          height: isMobile ? '100vh' : '500px',
          maxHeight: isMobile ? '100vh' : '80vh',
          background: '#fff',
          borderRadius: isMobile ? '0' : '16px 16px 0 0',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
          fontFamily: 'Arial, sans-serif',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          transition: 'bottom 0.3s ease',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? '16px' : '18px',
            borderBottom: '1px solid #eee',
            background: 'linear-gradient(135deg, #d2f6c4 0%, #b8e994 100%)',
            borderRadius: isMobile ? '0' : '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <div>
            <strong style={{ fontSize: isMobile ? '16px' : '18px', color: '#2d5016' }}>
              🌿 Ayurveda Chat Advisor
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: isMobile ? '11px' : '12px', color: '#4a7c2f', opacity: 0.9 }}>
              Ask about diet & wellness
            </p>
          </div>
          <button
            onClick={toggleChat}
            style={{
              background: 'none',
              border: 'none',
              color: '#2d5016',
              fontSize: isMobile ? '24px' : '28px',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              lineHeight: '1'
            }}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '12px' : '16px',
            background: '#f9f9f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.from === 'bot' ? 'left' : 'right',
                display: 'flex',
                justifyContent: msg.from === 'bot' ? 'flex-start' : 'flex-end'
              }}
            >
              <span
                style={{
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  background: msg.from === 'bot' ? '#e3f5e1' : '#b8e7fc',
                  borderRadius: '12px',
                  display: 'inline-block',
                  maxWidth: isMobile ? '85%' : '80%',
                  fontSize: isMobile ? '14px' : '15px',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  color: '#333'
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
          
          {waiting && (
            <div
              style={{
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'flex-start'
              }}
            >
              <span
                style={{
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  background: '#e3f5e1',
                  borderRadius: '12px',
                  fontSize: isMobile ? '14px' : '15px',
                  color: '#888',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
              >
                <span className="typing-dots">Bot is typing</span>...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            padding: isMobile ? '12px' : '14px',
            borderTop: '1px solid #eee',
            background: 'white',
            gap: '8px'
          }}
        >
          <input
            style={{
              flex: 1,
              padding: isMobile ? '10px 12px' : '12px 14px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              fontSize: isMobile ? '14px' : '15px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={waiting}
            autoComplete="off"
            onFocus={(e) => e.currentTarget.style.borderColor = '#3da34d'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
          />
          <button
            style={{
              padding: isMobile ? '10px 18px' : '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: (!input.trim() || waiting) ? '#ccc' : '#3da34d',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: isMobile ? '14px' : '15px',
              cursor: (!input.trim() || waiting) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            type="submit"
            disabled={!input.trim() || waiting}
            onMouseEnter={(e) => {
              if (input.trim() && !waiting && !isMobile) {
                e.currentTarget.style.backgroundColor = '#2d8a3c';
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim() && !waiting && !isMobile) {
                e.currentTarget.style.backgroundColor = '#3da34d';
              }
            }}
          >
            {waiting ? '⏳' : 'Send'}
          </button>
        </form>
      </div>

      {/* Optional: Add typing animation CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .typing-dots {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default ChatBox;
