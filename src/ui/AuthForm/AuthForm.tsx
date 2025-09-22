import './authForm.css'
import { useState } from 'react'
import { postLogin, postSignUp } from '../../api/authUsers';
import { useModal } from '../../store/authModal';
import { useSessionStore } from '../../store/useSessionStore';
import axios from "axios";

export const AuthForm = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [email, setEmail] = useState('');
  const [dateBirth, setDateBirth] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [registerStatusCode, setRegisterStatusCode] = useState(0);
  const [loginStatusCode, setloginStatusCode] = useState(0);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  
  const [isLogin, setIsLogin] = useState(true);
  const toggleModal = useModal(state => state.toggleModal);
  const { setMyUserId, setUsername } = useSessionStore();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      try {
        if (emailError || passwordError) {
          setloginStatusCode(401);
          return;
        };
        
        const response = await postLogin(email, password);
        setMyUserId(response.data.id);
        setUsername(response.data.username);
        localStorage.setItem("token", response.data.token);

        setEmail('');
        setPassword('');
        toggleModal();
      }
      catch (err: unknown) {
        if (!axios.isAxiosError(err)) {
          console.error("Неизвестная ошибка:", err);
          return
        };
        const status = err.response?.status;
        if (status) setloginStatusCode(status);
      }
      return
    }

    try {
      if (emailError || passwordError || passwordMismatchError) return;
      await postSignUp({usernameInput, email, dateBirth, password});
      
      setUsernameInput('');
      setEmail('');
      setDateBirth('');
      setPassword('');
      setPasswordConfirm(''); 
      setIsLogin(true);
      setIsAccountCreated(true);
      setTimeout(() => setIsAccountCreated(false), 5000);
    }
    catch (err) {
      if (!axios.isAxiosError(err)) {
        console.error("Неизвестная ошибка:", err);
        return
      };
      const status = err.response?.status;
      if (status) setRegisterStatusCode(status);
      setTimeout(() => setRegisterStatusCode(0), 5000);
    }
  }

  const colorError = '#e24f4fff';

  return (
    <div className='auth-modal'>
      <div className='auth-wrapper'>
        <button
          className='button-close-auth'
          onClick={toggleModal}
        >╳</button>

        {isAccountCreated && <p style={{ alignSelf: 'center', color: 'green', fontSize: '24px' }}>
          аккаунт успешно создан
        </p>}

        <form className="auth-form" onSubmit={onSubmit}>
          {!isLogin &&
            <input
              className='input-auth'
              required
              type="text"
              placeholder="Имя"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          }

          <input
            className='input-auth'
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={e => {
                const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (e.target.value.length < 6 || !regex.test(e.target.value)) setEmailError(true);
              }}
            onFocus={() => setEmailError(false)}
          />

          {!isLogin && emailError && <p style={{ color: colorError, fontSize: '24px' }}>
            Email должен содержать минимум 6 символов, пример: example@red.com
          </p>}

          {registerStatusCode === 409 && <p style={{ color: colorError, fontSize: '24px' }}>
            Пользователь с таким email уже зарегистрирован
          </p>}

          {!isLogin &&
            <input
              className='input-auth'
              type="date"
              required
              value={dateBirth}
              onChange={(e) => setDateBirth(e.target.value)}
            />
          }

          <p style={{ display: 'none' }}></p>
          <input
            className='input-auth'
            required
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={e => {
              if (e.target.value.length < 6) setPasswordError(true);
              if (password && passwordConfirm && password !== passwordConfirm) {
                setPasswordMismatchError(true);
              }
            }}
            onFocus={() => {
              setPasswordMismatchError(false);
              setPasswordError(false);
            }}
          />
          
          {!isLogin && passwordError && <p style={{ color: colorError, fontSize: '24px' }}>
            Пароль должен иметь не менее 6 символов
          </p>}
          {loginStatusCode === 401 && <p style={{ color: colorError, fontSize: '24px' }}>
            Неверный Email или пароль
          </p>}

          {!isLogin &&
            <input
              className='input-auth'
              required
              type="password"
              placeholder='Подтвердите пароль'
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onBlur={() => {
                if (password && passwordConfirm && password !== passwordConfirm) {
                  setPasswordMismatchError(true);
                }
              }}
              onFocus={() => setPasswordMismatchError(false) }
            />
          }

          {passwordMismatchError && <p style={{ color: colorError, fontSize: '24px' }}>
            Пароли не совпадают
          </p>}
          <button className='button-auth' type="submit">
            {isLogin ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <button
          className='button-toggle-auth'
          onClick={() => {
            isLogin ? setIsLogin(false) : setIsLogin(true);
            setEmailError(false);
            setPasswordError(false);
            setPasswordMismatchError(false);

            // очистка полей обязательно
            setUsernameInput("");
            setEmail("");
            setDateBirth("");
            setPassword("");
            setPasswordConfirm("");
          }}
        >
          {isLogin ? "Регистрация" : "У меня уже есть аккаунт"}
        </button>
      </div>
    </div>
  );
};
