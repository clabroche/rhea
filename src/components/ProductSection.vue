<template>
  <div class="product-section-root" :class="{mini}">
    <modal-vue ref="viewMore" height="auto" :noActions="true">
      <template #header>Liste des produits</template>
      <template #body="{data: items}" >
        <div v-if="items" class="more-container">
          <div v-for="item of items.slice(0,150)" :key="item._id" class="item">
            <img loading="lazy" :src="api.getImageURL(item.image)" alt="" @click="$router.push({name:'item', params: {itemId: item._id}})">
            <div class="title">{{item.name}}</div>
            <div class="add-list" @click="openAddToList(item)"><i class="fas fa-shopping-cart" aria-hidden="true"></i></div>
          </div>
        </div>
      </template>
    </modal-vue>
    <modal-vue ref="addToList" height="auto" :noActions="true">
      <template #header>Lists</template>
      <template #body="{data: item}" >
        <div v-if="item" class="lists">
          <div v-for="list of lists" :key="list._id" @click="addToList(list, item)" class="list">
            {{list.name}}
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </div>
        </div>
      </template>
    </modal-vue>
    <div class="label" v-if="headerText">
      <i :class="headerIcon" aria-hidden="true" v-if="headerIcon"></i>
      <span>{{headerText}}</span>
    </div>
    <div class="items" v-if="list.length">
      <div class="item" v-for="item of list.slice(0, 30)" :key="item._id">
        <img loading="lazy"  :src="api.getImageURL(item.image)" alt="" @click="$router.push({name:'item', params: {itemId: item._id}})">
        <div class="title">{{item.name}}</div>
        <div class="add-list" @click="openAddToList(item)"><i class="fas fa-shopping-cart" aria-hidden="true"></i></div>
      </div>
    </div>
    <div class="no-items" v-else>
      <i class="fas fa-plus" aria-hidden="true"></i>
      <div>
        {{noItemsText || 'Pas d\'éléments à afficher.'}}
      </div>
    </div>
    <div class="more" v-if="list.length > maxLimit" @click="viewMore">
      Voir plus...
    </div>
  </div>
</template>

<script>
import sort from 'fast-sort'
import lists from '../services/lists'
import ModalVue from './Modal.vue'
import notification from '../services/notification'
import api from '../services/API'
export default {
  components: {
    modalVue: ModalVue
  },
  props: {
    headerIcon: {default: '', type: String},
    headerText: {default: '', type: String},
    noItemsText: {default: '', type: String},
    list: {default: () =>([]), type: Array},
    listToAdd: {default: null},
    mini: {default: false}
  },
  data() {
    return {
      api,
      maxLimit: 5,
      lists: [],
    }
  },
  async mounted() {
    this.lists = await lists.getLists()
    sort(this.lists).desc(list => list._id)
  },
  methods: {
    viewMore() {
      this.$refs.viewMore.open(this.list)
    },
    openAddToList(item) {
      if(this.listToAdd) {
        return this.addToList(this.listToAdd, item)
      }
      this.$refs.addToList.open(item)
    },
    async addToList(list, item) {
      this.$refs.addToList.close()
      this.$emit('close', item)
      await lists.addItem(list._id, {
        _id: item._id,
        selected: 0,
        total: 1
      })
      .then(() => notification.next('success', `Le produit a été ajouté à la liste ${list.name}.`))
      .catch(() => notification.next('error', `Le produit n'a pu être ajouté à la liste ${list.name}.`))
    }
  }
}
</script>

<style lang="scss" scoped>
.product-section-root {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  &.mini {
    font-size: 0.8em;
    margin-bottom: 10px;
    .label {
      font-size: 1.2em;
    }
    .item {
      width: 50px;
    }
    img {
      width: 50px;
      height: 50px;
    }
    .more {
      display: none;
    }
  }
  .label {
    font-size: 1.5em;
    margin-bottom: 10px;
    color: var(--headerBgColor);
    i {
      margin-right: 10px;
    }
  }
  .items {
    display: flex;
    overflow: auto;
    padding: 2px;
    box-sizing: border-box;
  }
  .no-items {
    display: flex;
    align-items: center;
    color: #a2a2a2;
    flex-grow: 1;
    background-color: #ddd;
    border-radius: 4px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #bfbfbf;
    i {
      margin-right: 10px;
    }
  }
  .more {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    color: var(--headerBgColorAccent);
    margin-top: 10px;
  }
}
.more-container {
  display: flex;
  flex-wrap: wrap;
  max-height: calc(100vh - 300px);
  overflow: auto;
  justify-content: center;
  .item {
    width: 100px;
    margin-bottom: 10px;
  }
}
.item {
  width: 100px;
  margin-right: 10px;
  .title {
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .add-list {
    background-color: var(--headerBgColorAccent);
    color: white;
    @include backgroundGradient;
    text-align: center;
    border-radius: 4px;
    padding: 3px;
  }
  img {
    height: 100px;
    width: 100px;
    object-fit: cover;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 0 10px 2px #ccc;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }
}
.lists {
  max-height: 150px;
  overflow: auto;
  .list {
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    &:last-of-type {
      border-bottom: none;
    }
  }
}

</style>