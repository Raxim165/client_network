import './account.css'
import { getAge } from '../../utils/getAge';
import { Loader } from '../../ui/Loader/Loader';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../../store/useSessionStore';
import { useIsMyAccount } from '../../store/isMyAccount';
// import { getLogout } from '../../api/authUsers';
import { useGetUser, type User } from '../../api/user';

export const AccountPage = () => {
  const { setUsername, username } = useSessionStore();
  const { isMyAccount } = useIsMyAccount();
  const { state } = useGetUser();
  const [isAuthUser, setIsAuthUser] = useState(false);
  
  const renderSuccessState = (user: User) => {
    console.log(getAge(user.dateBirth));
    
    return (
      <div className='account-card'>
        <p className='username'>{user.username}</p>
        <p style={{ marginBottom: '22px' }}>Возраст: {getAge(user.dateBirth)}</p>
        {!isMyAccount &&
        <Link
          to={username ? `/chats/${user._id}` : ''}
          style={{ marginRight: '40px' }}
          onClick={() => {
            if (!username) setIsAuthUser(true);
            setTimeout(() => setIsAuthUser(false), 5000);
          }}
        >
          Написать
        </Link>}

        {isAuthUser && <p>Написать можно только после авторизации</p>}

        {isMyAccount &&
        <Link
          to={'/'}
          style={{ marginRight: '40px' }}
          onClick={async () => {
            // await getLogout();
            setUsername('');
            localStorage.clear();
            // localStorage.removeItem("token");
          }}>
            Выйти из аккаунта
        </Link>}
        {/* <Loader/> */}
        {/* <p>Дата регистрации: {user.createdAt}</p> */}
        {/* <p>Дата последнего входа: {user.updatedAt}</p> */}
      </div>
    )
  };


  switch (state.status) {
    case "loading": return <Loader />;
    case "error": return <p>{state.error}</p>;
    case "success": return renderSuccessState(state.user);
    // case "success": return <Loader />;
  }
}