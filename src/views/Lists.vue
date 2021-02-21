<template>
  <div class="root-lists">
    <welcome image="bullet" header="Mes listes" description=" " :mini="true" />
    <svg-background :bottom="lists && lists.length" svg="lists">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus" aria-hidden="true"></i> pour ajouter une nouvelle liste
    </svg-background>
    <div class="lists-container">
      <div v-for="list of sortedLists" :key="list._id" @click="$router.push({name:'list', params: {listId: list._id}})">
        <line-vue
          :additionalAction="true"
          :name="list.name"
          :description="list.description" 
          :additionalLeft="list.confs.length"
          :additionalCenter="dateFromObjectId(list._id)"
          @action="openOptions(list)"
        />
      </div>
    </div>
    <bottom-bar :text="lists.length + ' listes au total'" :actions="[{icon: 'fas fa-plus', cb: createList}]"/>
    <modal-vue ref="createModal">
      <template #body>
        <input type="text" v-model="listToCreate.name" placeholder="Nom...">
        <input type="text" v-model="listToCreate.description" placeholder="Description...">
      </template>
    </modal-vue>
    <options-vue ref="options" :options="[
      {label:  'Suppression', select: deleteList},
    ]"/>
  </div>
</template>

<script>
import BottomBarVue from '../components/BottomBar.vue';
import ModalVue from '../components/Modal.vue';
import Lists from '../services/lists.js';
import LineVue from '../components/Line.vue'
import OptionsVue from '../components/Options.vue';
import SvgBackgroundVue from '../components/SvgBackground.vue';
import sort from 'fast-sort'
import header from '../services/Header'
import dayjs from 'dayjs'
import Socket from '../services/Socket';
import Welcome from '../components/dashboard/Welcome.vue';
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    optionsVue: OptionsVue,
    svgBackground: SvgBackgroundVue,
    Welcome
  }, 
  data() {
    return {
      lists: [],
      selectedList: null,
      listToCreate: {
        name: '',
        description: ''
      }
    }
  },
  computed: {
    sortedLists() {
      return sort(this.lists).desc('_id')
    }
  },
  async mounted() {
    header.set('')
    await this.getLists()
    Socket.socket.on('lists:create', this.getLists)
    Socket.socket.on('lists:delete', this.getLists)
    Socket.socket.on('lists:update', this.getLists)
  },
  beforeUnmount() {
    Socket.socket.off('lists:create', this.getLists)
    Socket.socket.off('lists:delete', this.getLists)
    Socket.socket.off('lists:update', this.getLists)
  },
  methods: {
    dateFromObjectId (objectId) {
      const date = dayjs(new Date(parseInt(objectId.substring(0, 8), 16) * 1000))
      return date.format('DD/MM/YYYY')
    },
    async openOptions(list) {
      this.$refs.options.open(list.name)
      this.selectedList = list
    },
    async deleteList() {
      await Lists.deleteList(this.selectedList._id) 
      this.selecteList = null
      return this.getLists()
    },
    async getLists() {
      this.lists = await Lists.getLists()
    },
    createList() {
      this.$refs.createModal.open().subscribe(async (res) => {
        if(!res) return 
        await Lists.createList(this.listToCreate)
        this.listToCreate =  {
          name: '',
          description: ''
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.root-lists {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .lists-container {
    height:100%;
    padding: 10px;
    overflow: auto;
  }
}
</style>