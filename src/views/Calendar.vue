<template>
  <div>
    <modal-vue ref="createModal" :disabled="!current.recipeId">
      <template #body>
        {{moment(current.start).calendar()}}
        <multiselect :random="true" :options="allRecipes" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectItem"/>
      </template>
    </modal-vue>
    <rhea-calendar
      :events="events"
      @click-morning="clickMorning"
      @click-afternoon="clickAfternoon"
      />
    <button @click="generateWeekMeal">Générer mes repas de la semaine</button>
    <button @click="generateList">Générer une liste de course</button>
  </div>
</template>

<script>
import moment from 'moment'
import ModalVue from '../components/Modal.vue'
import 'vue-cal/dist/vuecal.css'
import 'vue-cal/dist/i18n/fr'
import Recipes from '../services/Recipe'
import PromiseB from 'bluebird'
import Events from '../services/EventsCalendar'
import Inventory from '../services/inventory'
import MultiselectVue from '../components/Multiselect.vue'
import lists from '../services/lists'
import header from '../services/Header'
import RheaCalendar from '../components/RheaCalendar.vue'
moment.locale('fr')
export default {
  components: {
    ModalVue,
    multiselect: MultiselectVue,
    RheaCalendar
  },
  data() {
    return {
      events: [],
      allRecipes: [],
      moment,
      current: {
        start: '',
        end: '',
        title: '',
        content: '',
        class: 'blue-event',
      }
    }
  },
  async mounted() {
    header.set('Calendrier')
    this.allRecipes = await Recipes.getRecipes()
    this.loadEvents()
    this.scrollToday()
  },
  methods: {
    viewChange($event) {
      this.currentView = $event.view
      setTimeout(() => {
        this.scrollToday()
      }, 500);
    },
    scrollToday() {
      // const calendar = document.querySelector('.vuecal .vuecal__cells')
      // calendar.scrollTo({ left: (moment().day() - 1) * 120, behavior: 'smooth' })
    },
    async deleteEvent(ev) {
      await Events.deleteEvent(ev._id)
      await this.loadEvents()
    },
    async generateList() {
      const inventory = await Inventory.get()
      const inventoryIds = inventory.items.map(item => item._id)
      const itemsId = []
      this.events.forEach(ev => {
        if(moment(ev.start).isAfter(moment())) {
          ev.recipes[0].itemsId.forEach(itemId => {
            if(!itemsId.includes(itemId) && !inventoryIds.includes(itemId)) {
              itemsId.push(itemId)
            }
          }) 
        }
      })
      const list = await lists.createList({name: 'Courses'})
      await PromiseB.map(itemsId, itemId => {
        return lists.addItem(list._id, {
          _id: itemId,
          selected: 0,
          total: 1
        })
      })
    },
    async generateWeekMeal() {
      const today = moment();
      const from_date = today.startOf('day');
      const events = []
      Array(7 - moment().day() + 1).fill(null).forEach((_, i) => {
        const $date = from_date.clone().add(i, 'days').set({hours: 12})
        events.push({
          recipeId: this.allRecipes[Math.floor(Math.random() * this.allRecipes.length)]._id,
          start: $date.format('YYYY-MM-DD HH:mm'),
          end: $date.add(7, 'hours').format('YYYY-MM-DD HH:mm'),
        },{
          recipeId: this.allRecipes[Math.floor(Math.random() * this.allRecipes.length)]._id,
          start: $date.format('YYYY-MM-DD HH:mm'),
          end: $date.add(7, 'hours').format('YYYY-MM-DD HH:mm'),
        })
      })
      await PromiseB.map(events, Events.createEvent)
      await this.loadEvents()
    },
    async loadEvents() {
      this.events = await Events.getEvents()
    },
    selectItem(recipes) {
      if(!recipes[0]) {
        this.current.recipeId =null
        this.current.title =null
      } else {
        this.current.recipeId = recipes[0]._id
        this.current.title = recipes[0].name
      }
    },
    clickMorning(ev) {
      if(ev.eventMorning) {
        this.deleteEvent(ev.eventMorning)
      } else {
        this.current = {
          title: '',
          content: '',
          class: 'blue-event',
        }
        this.current.start = ev.day.add(12, 'hours').format('YYYY-MM-DD HH:mm')
        this.current.end = ev.day.add(13, 'hours').format('YYYY-MM-DD HH:mm')
        
        this.$refs.createModal.open().subscribe(async res => {
          if(!res) return
          await Events.createEvent(this.current)
          this.loadEvents()
        })
      }
      console.log(ev)
    },

    clickAfternoon(ev) {
      if(ev.eventAfternoon) {
        this.deleteEvent(ev.eventAfternoon)
      } else {
        this.current = {
          title: '',
          content: '',
          class: 'blue-event',
        }
        this.current.start = ev.day.add(19, 'hours').format('YYYY-MM-DD HH:mm')
        this.current.end = ev.day.add(20, 'hours').format('YYYY-MM-DD HH:mm')
        console.log(this.current.start)
        this.$refs.createModal.open().subscribe(async res => {
          if(!res) return
          await Events.createEvent(this.current)
          this.loadEvents()
        })
      }
      console.log(ev)
    },
    click($event) {
      const $start = moment($event)
      $start.set({h: $start.hours() <= 19 && $start.hours() !== 0 ? 12 : 19, minutes: 0, seconds: 0})

      
    },
  }
}
</script>

<style lang="scss">
.vuecal__title-bar {background-color: var(--headerBgColor)}
.vuecal__title {color: var(--headerTextColor)}
.vuecal__view-btn.vuecal__view-btn--active {
  border-bottom: 3px solid var(--headerBgColorAccent)
}
.vuecal__flex.vuecal__menu {
  box-shadow: 0 0 10px 0 black;
}
.vuecal__event {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .delete {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.7em;
    z-index: 10;
  }
}
.vuecal__cell-date {
  height: 50px;
}
.vuecal__cell-events-count {
  width: 4px;
  min-width: 0;
  height: 4px;
  padding: 0;
  color: transparent;
}

</style>