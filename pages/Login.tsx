import { useState } from 'react'
import styles from '../styles/Login.module.css'
import api from './services/Api'
import { useCookies } from "react-cookie";
import Error from './services/Error';


export default function login(){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cookies, setCookie] = useCookies(["user_id","email","password", "token"]);
    const [error, setError] = useState('')

   

    const handleSubmit = (e: any) => {
        e.preventDefault()

        api.post('/user/login', {
            email,
            password
        }).then(res => {
            console.log(res.data)
            setCookie("user_id", res.data.user.id, { maxAge: 3600 * 24 });
            setCookie("email", res.data.user.email, { maxAge: 3600 * 24 });
            setCookie("password", res.data.user.password, { maxAge: 3600 * 24 });
            setCookie("token", res.data.token, { maxAge: 3600 * 24 });
            window.location.href = '/'
        }
        ).catch(err => {
            console.log(err)
            setError('Email ou senha incorretos')
            const error = document.getElementById('alert')
            Error(error, styles)
        }
        )
        
    }

    return (
        <>
        <div className={styles.content}>
            <div className={styles.img}>
        <img src="/317717-P94VDW-609.jpg" alt="" />
        </div>
        <form className={styles.login} onSubmit={(e: any) => handleSubmit(e)} autoComplete={'off'}>
            <h1>Chat  bot</h1>
            <span className={`${styles.alert} ${styles.none}`} id="alert">{error}</span>
            <fieldset className={styles.input}>
            <legend >Email</legend>
            <input type="email" onChange={(e) => setEmail(e.target.value)} name="" id=""  />
            </fieldset>
            <fieldset className={styles.input}>
            <legend>  Senha</legend>
            <input autoComplete={'off'} onChange={(e) => setPassword(e.target.value)} type="password" name="" id="" />
            </fieldset>
            <button>Entrar</button>
            <hr />
            <p>Ainda não possui cadastro? <a href="/register">Cadastre-se</a></p>
        </form >
        </div>
        </>
    )
}