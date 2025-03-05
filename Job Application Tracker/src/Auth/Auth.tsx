import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      {isLogin ? <LoginForm /> : <RegisterForm />}

      <span>
        {isLogin ? 'Need an account? ' : 'Already have an account? '}
        <a href="#" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Register' : 'Login'}
        </a>
      </span>
    </div>
  );
}

export default Auth;