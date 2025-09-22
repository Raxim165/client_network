import './header.css'
import { useModal } from '../../store/authModal';
import { AuthForm } from '../AuthForm/AuthForm';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../../store/useSessionStore';
import { useIsMyAccount } from '../../store/isMyAccount';

export const Header = () => {
  const toggleModal = useModal(state => state.toggleModal);
  const isOpenModal = useModal(state => state.isModalOpen);

  const { username, myUserId } = useSessionStore();
  const { setIsmyAccount } = useIsMyAccount();

  return (
    <>
     {isOpenModal && <AuthForm />}
     <header className="header">
       <Link to={'/'} className='header-link'>
        Главная
      </Link>
       
       <Link
         to={username ? `/account/${myUserId}` : ''}
         className="header-link"
         onClick={() => {
           if (!username) toggleModal()
           else setIsmyAccount(true)
           }
         }
       >
         {username ? username : 'Войти'}
       </Link>

       { username &&
         <Link to={'/chats'} className='header-link'>
           Чаты
         </Link>
        }
     </header>
    </>
  )
}
