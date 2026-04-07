import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Button, Input } from "antd";
import { BiMessageRoundedDetail, BiX, BiSend, BiBot, BiUser, BiMinus } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import chatService from "../../api/chatService";

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999; /* Ensure it's above EVERYTHING */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: auto;
`;

const ChatButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  outline: none;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(37, 99, 235, 0.4);
  }

  svg {
    font-size: 28px;
  }
`;

const ChatWindow = styled(motion.div)`
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;

  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    height: 70vh;
    right: 20px;
    bottom: 80px;
  }
`;

const ChatHeader = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .title {
    font-weight: 700;
    font-size: 1.1rem;
    margin: 0;
  }
  
  .status {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  
  button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      opacity: 1;
    }

    svg {
      font-size: 20px;
    }
  }
`;

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser ? '#2563eb' : 'white'};
  color: ${props => props.isUser ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: ${props => props.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InputContainer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 10px;
  background: white;
`;

const StyledInput = styled(Input)`
  border-radius: 20px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  
  &:focus, &.ant-input-focused {
    background: white;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    border: 1px solid #2563eb;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 18px 18px 18px 4px;
  width: fit-content;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  span {
    width: 6px;
    height: 6px;
    background: #94a3b8;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  span:nth-child(1) { animation-delay: -0.32s; }
  span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1.0); }
  }
`;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      text: "Hello! I am your Legal Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const toggleChat = () => {
    console.log("Toggling chat, current state:", isOpen);
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("Sending query to backend:", inputValue);
      const response = await chatService.sendQuery(inputValue);
      console.log("Received response from backend:", response);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in chatbot send:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <ChatbotContainer id="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChatHeader>
              <HeaderInfo>
                <BiBot size={24} />
                <div>
                  <div className="title">Legal Assistant</div>
                  <div className="status">Online | Powered by AI</div>
                </div>
              </HeaderInfo>
              <HeaderActions>
                <button onClick={toggleChat}>
                  <BiX size={20} />
                </button>
              </HeaderActions>
            </ChatHeader>

            <MessageListContainer>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  isUser={msg.isUser}
                  initial={{ opacity: 0, x: msg.isUser ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.text}
                </MessageBubble>
              ))}
              {isLoading && (
                <TypingIndicator>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingIndicator>
              )}
              <div ref={messagesEndRef} />
            </MessageListContainer>

            <InputContainer>
              <StyledInput
                placeholder="Ask something about Indian law..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<BiSend size={18} />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                style={{ background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}
              />
            </InputContainer>
          </ChatWindow>
        )}
      </AnimatePresence>

      <ChatButton
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        id="chatbot-trigger"
      >
        {isOpen ? <BiMinus size={28} /> : <BiMessageRoundedDetail size={28} />}
      </ChatButton>
    </ChatbotContainer>
  );
};

export default Chatbot;
