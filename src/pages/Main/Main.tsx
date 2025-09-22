import './main.css'
import { Loader } from '../../ui/Loader/Loader';
import { Link } from 'react-router-dom';
import { useGetUsers, type Users } from '../../api/users';
import { useSessionStore } from '../../store/useSessionStore';
import { useIsMyAccount } from '../../store/isMyAccount';

export const MainPage = () => {
  const { state } = useGetUsers();
  const { setRecipientId, setRecipientName } = useSessionStore();
  const { setIsmyAccount } = useIsMyAccount();

  const renderSuccessState = (users: Users[]) => (
    <div className='main'>
      <ul className='main-list'>
        {users.map(user => (
          <li key={user._id}>
            <Link
              className='main-link'
              to={`/account/${user._id}`}
              onClick={() => {
                setRecipientId(user._id);
                setRecipientName(user.username);
                setIsmyAccount(false);
              }}
            >
              {user.username}
            </Link>
          </li>))}
      </ul>
    </div>
  )

  switch (state.status) {
    case "loading": return <Loader />;
    case "error": return <p>{state.error}</p>;
    case "success": return renderSuccessState(state.users);
  }
}