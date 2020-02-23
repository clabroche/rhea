<template>
  <div class="root-lists">
    <svg-background :bottom="lists && lists.length" svg="list">
      <br>
      <div>Hey !</div>
      <br>
      Appuies sur le <i class="fas fa-plus"></i> pour ajouter une nouvelle liste
    </svg-background>
    <div class="lists-container">
      <div v-for="list of lists" :key="list._id" @click="$router.push({name:'list', params: {listId: list._id}})">
        <line-vue
          :additionalAction="true"
          :name="list.name"
          :description="list.description" 
          @action="openOptions(list)"
        />
      </div>
    </div>
    <bottom-bar :text="lists.length + ' listes au total'" @action="createList" />
    <modal-vue ref="createModal">
      <div slot="body">
        <input type="text" v-model="listToCreate.name" placeholder="Nom...">
        <input type="text" v-model="listToCreate.description" placeholder="Description...">
      </div>
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
export default {
  components: {
    'bottom-bar': BottomBarVue,
    'modal-vue': ModalVue,
    'line-vue': LineVue,
    optionsVue: OptionsVue,
    svgBackground: SvgBackgroundVue
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
  async mounted() {
    await this.getLists()
    this.interval = setInterval(async () => {
      await this.getLists()
    }, 500);
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
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