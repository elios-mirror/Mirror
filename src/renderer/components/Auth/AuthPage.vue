<template>
  <section class="hero is-fullheight">
    <div class="faceid" v-html="htmlFaceId"></div>

    <qrcode
      :options="{ foreground:'white', backgroundAlpha: 0, value: mirrorId, size:300 }"
      class="qrcode"
    ></qrcode>

    <div class="text-qrcode">Lancez l'application Elios pour associer le miroir à votre compte
      <br>Si vous rencontrez des problèmes vous pouvez entrer manuellement l'identifiant du miroir ci-dessous
      <br>
      <br>
      <div class="mirror-id">{{ mirrorId }}</div>
    </div>


    <div class="accounts-list" v-for="account in accounts" :key="account.user.id">
      <div class="card" v-on:click="loginAs(account)">{{ account.user.name }}</div>
    </div>
  </section>
</template>

<script lang="ts">
import Auth from "./Auth";

export default Auth;
</script>

<style scoped>
.hero {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qrcode {
  height: 25%;
  width: 25%;
}

.text-qrcode {
  color: white;
  padding-top: 100px;
  font-size: 20px;
}

.mirror-id {
  font-size: 25px;
  font-weight: bold;
}

.faceid {
  position: absolute;
  top: 0;
  right: 0;
  width: 30%;
}
</style>
