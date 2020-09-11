<template>
  <div class="root-notification">
    <div v-for="notif of notifs" :key="notif.id" class="notif" :class="type">

    </div>
  </div>
</template>

<script>
import event from '../services/notification'
import { v4 as uuid } from 'uuid';
export default {
  data() {
    return {
      notifs: []
    }
  },
  mounted() {
    event.subscribe((type, msg) => {
      const notif = {
        id: uuid.v4(),
        type, msg
      }
      this.notifs.push(notif)
    })
  }
}
</script>

<style lang="scss" scoped>
.root-notification {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100000;
  .notif {
    background-color: white;
    .error {
      border-left: 5px solid red;
      
    }
  }
}
</style>