import './chats.css'
import { Link, Outlet } from 'react-router-dom';
import { Loader } from '../../ui/Loader/Loader';
import { useGetUsers, type Users } from '../../api/users';
import { useSessionStore } from '../../store/useSessionStore';
import { useState } from 'react';

export const Chats = () => {
  const { state } = useGetUsers();
  const { setRecipientId, setRecipientName } = useSessionStore();
  const [isOpenSidebar , setIsOpenSidebar] = useState(true);

  const renderSuccessState = (users: Users[]) => (
    <div className={`chats ${isOpenSidebar ? "" : "closed"}`}>
      <button
        className={`hamburger ${isOpenSidebar ? "active" : ""}`}
        onClick={() => setIsOpenSidebar(!isOpenSidebar)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
  
      <div className={`chat-list ${isOpenSidebar ? "" : "close"}`}>
        <ul>
          {users.map(user => (
            <li key={user._id}>
              <Link
                to={`/chats/${user._id}`}
                onClick={() => {
                  setRecipientId(user._id);
                  setRecipientName(user.username);
                  setIsOpenSidebar(!isOpenSidebar);
                }}
                className="chat-link"
              >
                {user.username}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <section className="chat-content">
        <Outlet />
      </section>
    </div>
  )

  switch (state.status) {
    case "loading": return <Loader />;
    case "error": return <p>{state.error}</p>;
    case "success": return renderSuccessState(state.users);
  }
}