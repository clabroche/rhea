<template>
  <div class="login-root" :key="'login-'+register">
    <div class="logo">
      Rhea
    </div>
    <div class="content">
      <h2 class="title">{{registerOrLoginTitle}}</h2>
      <div class="content-box">
        <div class="inputs">
          <div class="input-container">
            <label><i class="fas fa-user"></i></label>
            <input type="text" :value="user.email" @input="user.email = $event.target.value" placeholder="Email/Pseudo" @keypress.enter="register ? registerFun() : login()">
          </div>
          <div class="input-container">
            <label><i class="fas fa-key"></i></label>
            <input type="password" :value="user.password" @input="user.password = $event.target.value" placeholder="Mot de passe" @keypress.enter="register ? registerFun() : login()">
          </div>
        </div>
        <div class="action">
          <button v-if="!register" @click="login" :disabled="!user.email || !user.password">Se connecter <i class="fas fa-sign-in-alt"></i></button>
          <button v-else @click="registerFun" :disabled="!user.email || !user.password">S'enregistrer <i class="fas fa-sign-in-alt"></i></button>
        </div>
        <div class="switch">
          <div v-if="!register">Vous n'avez pas de compte ? <router-link to="register">Enregistrez-vous</router-link></div>
          <div v-else>Vous avez déjà un compte ?<router-link to="login">Connectez-vous</router-link></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, watch } from 'vue'
import Auth from '../services/Auth'
import Header from '../services/Header'
import router from '../router'
import User from '../services/User'
import notification from '../services/notification'

export default {
  props: {
    register: {default: false}
  },
  setup(props) {
    // Is a register or login page
    const registerOrLoginTitle = computed(() => {
      return props.register ?  'Enregistrement' : 'Connection'
    })
    watch(() => registerOrLoginTitle.value, () => {
      Header.set(registerOrLoginTitle.value)
    })

    // Build user to bind template and code
    const user = reactive(new User())
    const checkRequirments = () => {
      if(!user.email) return notification.next('error', 'Vous n\'avez pas rempli le champ Email')
      if(!user.password) return notification.next('error', 'Vous n\'avez pas rempli le champ de mot de passe')
      return true
    }
    /** @param {Error} err */
    const handleError = err => {
      if(err?.response?.status === 404) {
        return notification.next('error', 'L\'utilisateur n\'existe pas')
      }
      if(err?.response?.status === 401) {
        return notification.next('error', 'Le mot de passe est incorrect')
      }
      if(err?.response?.status === 400 && err?.response?.data === 'User already exist') {
        return notification.next('error', 'Cet utilisateur est déjà enregistré')
      }
      return notification.next('error', 'Erreur inconnue')
    }
    return {
      user,
      registerOrLoginTitle,
      async login() {
        if(!checkRequirments()) return
        await Auth.login(user)
          .then(() => router.push({name: 'home'}))
          .catch(handleError)
      },
      async registerFun() {
        if(!checkRequirments()) return
        await Auth.register(user)
          .then(() => router.push({name: 'home'}))
          .catch(handleError)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: white;
  @include backgroundGradientImage(0.6, '../assets/login.jpg');
  .logo {
    font-family: Logo;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    font-size: 5em;
  }  
  .content {
    width: 100%;
    max-width: 550px;
    padding: 25px;
    box-sizing: border-box;
    .input-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
      i {
        margin-right: 10px;
      }
      input {
        color: white;
        border-color: white;
        &::placeholder {
          color: rgb(199, 199, 199);
        }
      }
    }
    .action {
      margin: auto;
      width: max-content;
      button {
        margin-top: 40px;
        border-radius: 20px;
        height: 50px;
        width: 150px;
        font-weight: bold;
      }
    }
    .switch {
      margin-top: 60px;
      color: rgb(173, 173, 173);
      font-size: 0.8em;
      text-align: center;
      a {
        color: white;
        font-weight: bold;
      }
    }
  }
}
</style>