import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import chatService from "../../api/chatService";

const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(26,86,219,0.55), 0 0 0 0 rgba(26,86,219,0.2); }
  70%  { box-shadow: 0 0 0 12px rgba(26,86,219,0), 0 0 0 24px rgba(26,86,219,0); }
  100% { box-shadow: 0 0 0 0 rgba(26,86,219,0), 0 0 0 0 rgba(26,86,219,0); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
  40%            { transform: scale(1);   opacity: 1;   }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const Root = styled.div`
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
  pointer-events: auto;
`;

const TriggerBtn = styled(motion.button)`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid rgba(96,165,250,0.45);
  background: linear-gradient(145deg, #0e1e3d 0%, #1a56db 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  animation: ${pulseRing} 2.8s infinite;
  padding: 0;
  overflow: hidden;
`;

const LawyerSVG = () => (
  <svg width="54" height="54" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="26" cy="13" rx="13" ry="7" fill="#f1f0eb"/>
    <ellipse cx="14" cy="17" rx="4" ry="6" fill="#e8e6de"/>
    <ellipse cx="38" cy="17" rx="4" ry="6" fill="#e8e6de"/>
    <ellipse cx="14" cy="22" rx="3.5" ry="4" fill="#f1f0eb"/>
    <ellipse cx="38" cy="22" rx="3.5" ry="4" fill="#f1f0eb"/>
    <ellipse cx="20" cy="8" rx="4" ry="3" fill="#f1f0eb"/>
    <ellipse cx="26" cy="7" rx="4" ry="3" fill="#f1f0eb"/>
    <ellipse cx="32" cy="8" rx="4" ry="3" fill="#f1f0eb"/>
    <ellipse cx="26" cy="22" rx="9" ry="10" fill="#f5c9a0"/>
    <ellipse cx="22.5" cy="21" rx="1.4" ry="1.6" fill="#1e293b"/>
    <ellipse cx="29.5" cy="21" rx="1.4" ry="1.6" fill="#1e293b"/>
    <circle cx="23.1" cy="20.3" r="0.45" fill="white"/>
    <circle cx="30.1" cy="20.3" r="0.45" fill="white"/>
    <path d="M21 18.8 Q22.5 17.8 24 18.8" stroke="#7c4a1e" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
    <path d="M28 18.8 Q29.5 17.8 31 18.8" stroke="#7c4a1e" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
    <path d="M26 23 Q25 25 26 25.5 Q27 25 26 23Z" fill="#d4956a"/>
    <path d="M23.5 27.5 Q26 29.5 28.5 27.5" stroke="#b5622e" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
    <path d="M11 52 L11 36 Q12 30 26 28 Q40 30 41 36 L41 52Z" fill="#0f172a"/>
    <path d="M26 28 L19 36 L22 52 L26 44 L30 52 L33 36Z" fill="#1e293b"/>
    <rect x="23" y="29" width="6" height="3.5" rx="1" fill="white"/>
    <rect x="23.5" y="32" width="2.3" height="6" rx="1" fill="white"/>
    <rect x="26.2" y="32" width="2.3" height="6" rx="1" fill="white"/>
    <circle cx="26" cy="40" r="1.4" fill="#f59e0b"/>
    <circle cx="26" cy="45" r="1.4" fill="#f59e0b"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
  </svg>
);

const Window = styled(motion.div)`
  width: 420px;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid rgba(26,86,219,0.4);
  display: flex;
  flex-direction: column;
  height: 560px;
  margin-bottom: 16px;
  background: #07101e;

  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    height: 72vh;
  }
`;

const RainbowBar = styled.div`
  height: 4px;
  background: linear-gradient(90deg, #c084fc, #1a56db, #06b6d4, #f59e0b);
  flex-shrink: 0;
`;

const HeaderBody = styled.div`
  background: #0e1e3d;
  padding: 14px 20px 0;
  flex-shrink: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const HeaderAvatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #1a2f5a;
  border: 2px solid #1a56db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #22c55e;
    border: 2px solid #0e1e3d;
    bottom: 1px;
    right: 1px;
  }
`;

const HeaderText = styled.div`
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #60a5fa;
    margin-bottom: 3px;
  }
  .name {
    font-size: 17px;
    font-weight: 700;
    color: #e0f2fe;
    line-height: 1.15;
    font-family: 'Georgia', serif;
  }
  .sub {
    font-size: 11px;
    color: rgba(148,163,184,0.65);
    margin-top: 2px;
  }
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover { background: rgba(26,86,219,0.25); color: #e0f2fe; }
`;

const TagsRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px 0 10px;
  border-top: 1px solid rgba(26,86,219,0.18);
  flex-wrap: wrap;
`;

const Tag = styled.span<{ $v: 'blue' | 'amber' | 'teal' | 'purple' }>`
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 500;
  ${p => p.$v === 'blue'   && 'background:rgba(26,86,219,0.2);color:#93c5fd;border:1px solid rgba(26,86,219,0.4);'}
  ${p => p.$v === 'amber'  && 'background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(245,158,11,0.35);'}
  ${p => p.$v === 'teal'   && 'background:rgba(6,182,212,0.15);color:#67e8f9;border:1px solid rgba(6,182,212,0.35);'}
  ${p => p.$v === 'purple' && 'background:rgba(192,132,252,0.15);color:#e9d5ff;border:1px solid rgba(192,132,252,0.35);'}
`;

const MsgList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px 16px;
  background: #07101e;
  display: flex;
  flex-direction: column;
  gap: 14px;
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(26,86,219,0.3); border-radius: 4px; }
`;

const MsgRow = styled.div<{ $user: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  justify-content: ${p => p.$user ? 'flex-end' : 'flex-start'};
  animation: ${slideUp} 0.28s ease forwards;
`;

const AvatarSm = styled.div<{ $user: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  background: ${p => p.$user ? 'rgba(22,163,74,0.2)' : 'rgba(26,86,219,0.2)'};
  border: 1.5px solid ${p => p.$user ? 'rgba(22,163,74,0.5)' : 'rgba(26,86,219,0.5)'};
  color: ${p => p.$user ? '#4ade80' : '#60a5fa'};
`;

// ← KEY CHANGE: gradients instead of flat colours
const Bubble = styled(motion.div)<{ $user: boolean }>`
  max-width: 73%;
  padding: 11px 15px;
  font-size: 13.5px;
  line-height: 1.65;
  border-radius: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  ${p => p.$user ? `
    background: linear-gradient(135deg, #0d2a1a 0%, #1a3a2a 60%, #0f2d20 100%);
    color: #dcfce7;
    border: 1px solid rgba(22,163,74,0.3);
    border-bottom-right-radius: 4px;
    border-right: 3px solid #16a34a;
  ` : `
    background: linear-gradient(135deg, #071428 0%, #0d1e38 55%, #130d2e 100%);
    color: #cbd5e1;
    border: 1px solid rgba(26,86,219,0.22);
    border-bottom-left-radius: 4px;
    border-left: 3px solid #1a56db;
  `}

  .lbl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 5px;
    font-weight: 600;
    opacity: 0.6;
    color: ${p => p.$user ? '#4ade80' : '#60a5fa'};
  }
`;

const TypingDots = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px 16px;
  background: #0d1e38;
  border: 1px solid rgba(26,86,219,0.2);
  border-left: 3px solid #c084fc;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  width: fit-content;

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
    animation: ${dotBounce} 1.3s infinite ease-in-out both;
  }
  span:nth-child(1) { background: #60a5fa; animation-delay: -0.3s; }
  span:nth-child(2) { background: #c084fc; animation-delay: -0.15s; }
  span:nth-child(3) { background: #06b6d4; animation-delay: 0s; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  span {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(100,116,139,0.55);
    white-space: nowrap;
  }
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(100,116,139,0.18);
  }
`;

const QuickRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const QBtn = styled.button<{ $c: 'blue' | 'purple' | 'amber' }>`
  font-size: 11px;
  padding: 5px 13px;
  border-radius: 20px;
  border: 1px solid;
  cursor: pointer;
  background: transparent;
  font-family: inherit;
  transition: opacity 0.15s;
  &:hover { opacity: 0.7; }
  ${p => p.$c === 'blue'   && 'border-color:rgba(26,86,219,0.45);color:#93c5fd;'}
  ${p => p.$c === 'purple' && 'border-color:rgba(167,139,250,0.4);color:#c4b5fd;'}
  ${p => p.$c === 'amber'  && 'border-color:rgba(245,158,11,0.4);color:#fcd34d;'}
`;

const InputArea = styled.div`
  padding: 12px 16px;
  background: #0e1e3d;
  border-top: 1px solid rgba(26,86,219,0.22);
  display: flex;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
`;

const ChatInput = styled.input`
  flex: 1;
  background: #07101e;
  border: 1px solid rgba(26,86,219,0.3);
  border-radius: 10px;
  padding: 10px 14px;
  color: #cbd5e1;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: rgba(100,116,139,0.55); font-style: italic; }
  &:focus { border-color: rgba(26,86,219,0.7); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const SendBtn = styled.button<{ $active: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: ${p => p.$active ? '#1a56db' : 'rgba(26,86,219,0.25)'};
  color: ${p => p.$active ? 'white' : 'rgba(96,165,250,0.4)'};
  cursor: ${p => p.$active ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s, background 0.2s;
  &:hover { transform: ${p => p.$active ? 'scale(1.06)' : 'none'}; }
`;

const Footer = styled.div`
  padding: 7px 16px;
  background: #07101e;
  border-top: 1px solid rgba(26,86,219,0.1);
  text-align: center;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(100,116,139,0.4);
  flex-shrink: 0;
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
      text: "Your Honour, I am ready to assist. Present your matter — I shall advise under Indian law with full statutory reference.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: inputValue, isUser: true, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInputValue("");
    setIsLoading(true);
    try {
      const res = await chatService.sendQuery(userMsg.text);
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        text: res.response,
        isUser: false,
        timestamp: new Date(res.timestamp),
      }]);
    } catch {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        text: "My apologies, Counsel. The chambers appear unavailable. Please try again shortly.",
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <Root id="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <Window
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <RainbowBar />
            <HeaderBody>
              <HeaderRow>
                <HeaderLeft>
                  <HeaderAvatar>
                    <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
                      <ellipse cx="26" cy="13" rx="13" ry="7" fill="#f1f0eb"/>
                      <ellipse cx="14" cy="17" rx="4" ry="6" fill="#e8e6de"/>
                      <ellipse cx="38" cy="17" rx="4" ry="6" fill="#e8e6de"/>
                      <ellipse cx="14" cy="22" rx="3.5" ry="4" fill="#f1f0eb"/>
                      <ellipse cx="38" cy="22" rx="3.5" ry="4" fill="#f1f0eb"/>
                      <ellipse cx="20" cy="8" rx="4" ry="3" fill="#f1f0eb"/>
                      <ellipse cx="26" cy="7" rx="4" ry="3" fill="#f1f0eb"/>
                      <ellipse cx="32" cy="8" rx="4" ry="3" fill="#f1f0eb"/>
                      <ellipse cx="26" cy="22" rx="9" ry="10" fill="#f5c9a0"/>
                      <ellipse cx="22.5" cy="21" rx="1.4" ry="1.6" fill="#1e293b"/>
                      <ellipse cx="29.5" cy="21" rx="1.4" ry="1.6" fill="#1e293b"/>
                      <circle cx="23.1" cy="20.3" r="0.45" fill="white"/>
                      <circle cx="30.1" cy="20.3" r="0.45" fill="white"/>
                      <path d="M21 18.8 Q22.5 17.8 24 18.8" stroke="#7c4a1e" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
                      <path d="M28 18.8 Q29.5 17.8 31 18.8" stroke="#7c4a1e" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
                      <path d="M26 23 Q25 25 26 25.5 Q27 25 26 23Z" fill="#d4956a"/>
                      <path d="M23.5 27.5 Q26 29.5 28.5 27.5" stroke="#b5622e" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
                      <path d="M11 52 L11 36 Q12 30 26 28 Q40 30 41 36 L41 52Z" fill="#0f172a"/>
                      <path d="M26 28 L19 36 L22 52 L26 44 L30 52 L33 36Z" fill="#1e293b"/>
                      <rect x="23" y="29" width="6" height="3.5" rx="1" fill="white"/>
                      <rect x="23.5" y="32" width="2.3" height="6" rx="1" fill="white"/>
                      <rect x="26.2" y="32" width="2.3" height="6" rx="1" fill="white"/>
                      <circle cx="26" cy="40" r="1.4" fill="#f59e0b"/>
                      <circle cx="26" cy="45" r="1.4" fill="#f59e0b"/>
                    </svg>
                  </HeaderAvatar>
                  <HeaderText>
                    <div className="eyebrow">Adjournment.ai</div>
                    <div className="name">Legal Counsel AI</div>
                    <div className="sub">Indian Jurisdiction · Bar Certified</div>
                  </HeaderText>
                </HeaderLeft>
                <CloseBtn onClick={() => setIsOpen(false)} aria-label="Close">
                  <CloseIcon />
                </CloseBtn>
              </HeaderRow>
              <TagsRow>
                <Tag $v="blue">IPC</Tag>
                <Tag $v="amber">Evidence Act</Tag>
                <Tag $v="teal">CrPC · CPC</Tag>
                <Tag $v="purple">Constitution</Tag>
              </TagsRow>
            </HeaderBody>

            <MsgList>
              {messages.map(msg => (
                <MsgRow key={msg.id} $user={msg.isUser}>
                  {!msg.isUser && <AvatarSm $user={false}>AI</AvatarSm>}
                  <Bubble
                    $user={msg.isUser}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="lbl">{msg.isUser ? "Client" : "Legal Counsel"}</div>
                    {msg.text}
                  </Bubble>
                  {msg.isUser && <AvatarSm $user={true}>You</AvatarSm>}
                </MsgRow>
              ))}

              {isLoading && (
                <MsgRow $user={false}>
                  <AvatarSm $user={false}>AI</AvatarSm>
                  <TypingDots><span /><span /><span /></TypingDots>
                </MsgRow>
              )}

              {messages.length === 1 && !isLoading && (
                <>
                  <Divider><span>Suggested queries</span></Divider>
                  <QuickRow>
                    <QBtn $c="blue" onClick={() => setInputValue("Explain bail procedure under CrPC")}>Bail procedure</QBtn>
                    <QBtn $c="purple" onClick={() => setInputValue("What are my FIR filing rights?")}>FIR filing rights</QBtn>
                    <QBtn $c="amber" onClick={() => setInputValue("How do I get free legal aid?")}>Legal aid</QBtn>
                  </QuickRow>
                </>
              )}

              <div ref={endRef} />
            </MsgList>

            <InputArea>
              <ChatInput
                placeholder="State your legal query…"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                onKeyPress={handleKey}
                disabled={isLoading}
              />
              <SendBtn $active={!!inputValue.trim() && !isLoading} onClick={handleSend} aria-label="Send">
                <SendIcon />
              </SendBtn>
            </InputArea>

            <Footer>Powered by Adjournment.ai · All proceedings are confidential</Footer>
          </Window>
        )}
      </AnimatePresence>

      <TriggerBtn
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(p => !p)}
        id="chatbot-trigger"
        aria-label="Open Legal Assistant"
      >
        {isOpen ? <CloseIcon /> : <LawyerSVG />}
      </TriggerBtn>
    </Root>
  );
};

export default Chatbot;