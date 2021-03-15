<template>
  <div class="calendar-root">
    <modal-vue ref="createModal" :disabled="!current.recipeId">
      <template #body>
        {{moment(current.start).calendar()}}
        <multiselect :random="true" :options="allRecipes" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectItem"/>
      </template>
    </modal-vue>
    <welcome image="calendar" :mini="true" description="On va se régaler cette semaine" header="Calendrier"/>
    <div class="calendar-container">
      <rhea-calendar
        :events="events"
        @change-date="weekDate = $event"
        @click-morning="clickMorning"
        @click-afternoon="clickAfternoon"
        />
      <button @click="generateWeekMeal">Générer mes repas de la semaine</button>
    </div>
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
import Welcome from '../components/dashboard/Welcome.vue'
import {getDatesBetweenDates} from '../helpers/date'
import dayjs from 'dayjs'
import sort from "fast-sort"
moment.locale('fr')
export default {
  components: {
    ModalVue,
    multiselect: MultiselectVue,
    RheaCalendar,
    Welcome
  },
  data() {
    return {
      weekDate: dayjs().startOf('week'),
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
  },
  methods: {
    viewChange($event) {
      this.currentView = $event.view
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
      const isWeekDay = (date) => date.get('days') === 0 || date.get('days') === 6
      const events = []
      const healthyMeals = sort(this.allRecipes.filter(recipe => recipe.healthy >= 3)).asc(() => Math.random() - 0.5)
      const healthyMealsIds = healthyMeals.map(recipe => recipe._id)
      const cheapMeals = sort(this.allRecipes.filter(recipe => recipe.score >= 4 && recipe.healthy <=3 && !healthyMealsIds.includes(recipe._id))).asc(() => Math.random() - 0.5)
      getDatesBetweenDates(this.weekDate.startOf('week'), this.weekDate.endOf('week'))
        .forEach((date) => {
          events.push({
            recipeId: (isWeekDay(date) ? cheapMeals : healthyMeals).pop()?._id,
            start: date.set('hour', 12).format('YYYY-MM-DD HH:mm'),
            end: date.set('hour', 13).format('YYYY-MM-DD HH:mm'),
          },{
            recipeId: (isWeekDay(date) ? cheapMeals : healthyMeals).pop()?._id,
            start: date.set('hour', 19).format('YYYY-MM-DD HH:mm'),
            end: date.set('hour', 20).format('YYYY-MM-DD HH:mm'),
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
        this.askForRecipe()
      }
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
        this.askForRecipe()
      }
    },
    askForRecipe() {
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return
        await Events.createEvent(this.current)
        this.loadEvents()
      })
    },
    click($event) {
      const $start = moment($event)
      $start.set({h: $start.hours() <= 19 && $start.hours() !== 0 ? 12 : 19, minutes: 0, seconds: 0})

      
    },
  }
}
</script>
<style lang="scss" scoped>
.calendar-root {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .calendar-container {
    overflow: auto;
  }
}
</style>