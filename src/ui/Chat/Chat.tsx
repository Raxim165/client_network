import './chat.css'
import React, { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '../../store/useSessionStore';

type Message = {
  myUserId: string;
  recipientId: string;
  username: string;
  recipientName: string;
  message: string;
  timestamp: number;
}

export const Chat = () => {
  const { recipientId, recipientName, myUserId, username } = useSessionStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; msgId: number;
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  // const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`https://server-network.onrender.com/messages?myUserId=${myUserId}&recipientId=${recipientId}`)
      .then((res) => res.json()).then(setMessages);

    const socket = new WebSocket('wss://server-network.onrender.com');
    socketRef.current = socket;
    socket.onopen = () =>
      socket.send(JSON.stringify({ type: 'login', myUserId, recipientId, username }));

    socket.onmessage = e => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'isOnline') setIsOnline(msg.isOnline);

      if (msg.type === 'delete-message') {
        setMessages(prev => prev.filter(m => m.timestamp !== msg.msgId));
      }

      if (msg.myUserId !== recipientId) return;
      if (msg.type === 'message') {
        setMessages(prev => [...prev, msg])
      };

      msg.type === 'typing' ? setIsTyping(true) : setIsTyping(false);
    };

    return () => socket.close();
  }, [myUserId, recipientId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = {
      type: 'message',
      myUserId,
      recipientId,
      username,
      recipientName,
      message,
      timestamp: Date.now(),
    };
    socketRef.current?.send(JSON.stringify(msg));

    console.log(msg.myUserId, msg.recipientId);
    if (msg.myUserId !== msg.recipientId) setMessages(prev => [ ...prev, msg ]);
    setMessage('');
  }

  const deleteMessage = (msgId: number) => {
    if (!recipientId || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({ type: 'delete-message', msgId, recipientId }));
    setContextMenu(null);
  }

  useEffect(() => () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!recipientId || !socketRef.current) return;

    socketRef.current.send(JSON.stringify({ type: 'typing', myUserId, recipientId }))

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socketRef.current?.send(JSON.stringify({ type: 'stop-typing', myUserId, recipientId }))
    }, 2000)
  }

  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = new Date(msg.timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  const onOpenMenu = (e: React.MouseEvent, msgId: number) => {
    e.preventDefault()
    if (!chatRef.current) return;

    const rect = chatRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const menuWidth = 150;
    let posX = clickX
    // Если клик слишком близко к правому краю — сместить меню влево
    if (clickX + menuWidth > rect.width) posX = rect.width - menuWidth - 10; // небольшой отступ
    setContextMenu({ x: posX, y: clickY, msgId });
  }

  useEffect(() => {
    const chat = document.querySelector('.chat-messages');
    if (!chat) return;

    chat.addEventListener('scroll', () => setContextMenu(null));
    return () => chat.removeEventListener('scroll', () => setContextMenu(null));
  }, [contextMenu]);

//   const handleTouchStart = (e: React.TouchEvent | React.MouseEvent, msgId: number) => {
//     if (!chatRef.current) return;
  
//     const rect = chatRef.current.getBoundingClientRect();
//     const menuWidth = 150;
  
//     let clientX: number, clientY: number;
  
//     if ('touches' in e && e.touches.length > 0) {
//       // Touch-событие
//       clientX = e.touches[0].clientX;
//       clientY = e.touches[0].clientY;
//     } else {
//       // Mouse-событие
//       clientX = (e as React.MouseEvent).clientX;
//       clientY = (e as React.MouseEvent).clientY;
//     }
  
//     const clickX = clientX - rect.left;
//     const clickY = clientY - rect.top;
  
//     let posX = clickX;
//     if (clickX + menuWidth > rect.width) posX = rect.width - menuWidth - 10;
  
//     longPressTimeout.current = setTimeout(() =>
//       setContextMenu({x: posX, y: clickY, msgId }), 400);
// };
  
//   const handleTouchEnd = () => {
//     if (longPressTimeout.current) {
//       clearTimeout(longPressTimeout.current);
//       longPressTimeout.current = null;
//     };
//   };

  return (
    <div className='chat' ref={chatRef}>
      <div className='status'>
        {isOnline ? '🟢' : '🔴'} {recipientName}{' '}
        {isTyping &&
        <div className="dots-container">
          печатает
          <span style={{ marginLeft: '4px'}}></span><span></span><span></span>
        </div>}
      </div>
      
      <div className='chat-messages'>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="date-label">{date}</div>
            {msgs.map((msg, i) => (
              <p
                className='message-wrapper'
                key={msg.timestamp + i}
                style={{ textAlign: msg.myUserId === myUserId ? 'right' : 'left' }}
                ref={messages[messages.length - 1] === msg ? messagesEndRef : undefined}
              >
                <span
                  onContextMenu={(e) => onOpenMenu(e, msg.timestamp)}

                  // onTouchStart={(e) => handleTouchStart(e, msg.timestamp)}
                  // onTouchEnd={handleTouchEnd}
                  className='message'
                  style={{ backgroundColor: msg.myUserId === myUserId ? '#7e18dd' : '#444' }}
                >
                  {msg.message}
                  <br />
                  <span
                    style={{ textAlign: msg.myUserId === myUserId ? 'right' : 'left' }}
                    className="message-time"
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </span>
              </p>
            ))}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => setContextMenu(null)}>❌ Закрыть</button>
          {String(contextMenu.msgId) === myUserId &&
          <button className='button-change-message'>✏️ Изменить</button>}
          <button onClick={() => deleteMessage(contextMenu.msgId)}>🗑️ Удалить</button>
        </div>
      )}

      <form className='chat-form' onSubmit={e => e.preventDefault()}>
        <input
          style={{ width: '80%' }}
          value={message}
          onChange={handleInput}
          placeholder="Введите сообщение..."
        />
        <button type="submit" onClick={sendMessage}>Отправить</button>
      </form>
    </div>
  )
}
