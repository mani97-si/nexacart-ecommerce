import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useApp} from '../context/AppContext';
import toast from 'react-hot-toast';

export function Login(){
  const {login}=useApp();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const nav=useNavigate();

  async function go(e){
    e.preventDefault();
    try{
      await login(email,password);
      nav('/');
    }catch(e){
      toast.error(e.response?.data?.message||'Could not continue');
    }
  }

  return <AuthShell
    title="Continue to NexaCart"
    sub="Enter any email and password. New emails get an account automatically."
  >
    <form onSubmit={go}>
      <label>Email<input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>Password<input required type="password" autoComplete="current-password" placeholder="Choose a password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <button className="btn full">Continue</button>
    </form>
    <p className="authhint">No email verification or separate registration is required.</p>
    <p><Link to="/">Continue shopping without signing in</Link></p>
  </AuthShell>
}

export function Register(){
  return <Login />;
}

function AuthShell({title,sub,children}){
  return <section className="auth"><div className="authcard">
    <Link to="/" className="brand">Nexa<span>Cart</span></Link>
    <h1>{title}</h1><p>{sub}</p>{children}
  </div></section>
}
