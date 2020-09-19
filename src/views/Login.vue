<template>
  <div class="login-root" :key="'login-'+register">
    <div class="content">
      <div class="title" v-if="register">
        Enregistrement
      </div>
      <div class="title" v-else>
        Connexion
      </div>
      <div class="content-box">
        <div class="inputs">
          <label for="">Email/Pseudo</label>
          <input type="text" v-model="user.email">
          <label for="">Mot de passe</label>
          <input type="password" v-model="user.password">
        </div>
        <div class="action">
          <router-link to="register" v-if="!register">S'enregistrer</router-link>
          <router-link to="login" v-else>Se connecter</router-link>
          <button v-if="!register" @click="login" :disabled="!user.email || !user.password">Se connecter</button>
          <button v-else @click="registerFun" :disabled="!user.email || !user.password">S'enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from '../services/Auth'
import Header from '../services/Header'

export default {
  props: {
    register: {default: false}
  },
  data() {
    return {
      user: {
        email: null,
        password: null,
      }
    }
  },
  watch: {
    register() {
      Header.set(this.register ? 'Enregistrement' : 'Connection')
    }
  },
  methods: {
    async login() {
      await Auth.login(this.user)
      this.$router.push({name: 'lists'})
    },
    async registerFun() {
      await Auth.register(this.user)
      this.$router.push({name: 'lists'})
    }
  }
}
</script>

<style lang="scss" scoped>

.login-root {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('../assets/login.jpg');
  .content {
    background-color: white;
    width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    .title {
      background-color: var(--headerBgColor);
      color: var(--headerTextColor);
      padding: 10px;
      box-sizing: border-box;
      font-size: 2em;
      width: 100%;
    }
    label {
      margin-top: 20px;
    }
  }
  .content-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    .inputs {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .action {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      button { padding: 10px; }
      a { color: white; }
    }
  }
}
</style>