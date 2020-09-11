<template>
  <div>
    <modal-vue ref="createModal" :disabled="!current.recipeId">
      <div slot="body">
        {{moment(current.start).calendar() | capitalize}}
        <multiselect :options="allRecipes" customKey="_id" customLabel="name" :single="true" placeholder="Choisir un produit..." @input="selectItem"/>
      </div>
    </modal-vue>
    <vue-cal
      ref="vuecal"
      locale="fr"
      :events="events"
      :time-from="12*60"
      :time-to="24 * 60"
      :time-step="7*60" 
      :time-cell-height="120"
      :minCellWidth="120"
      :disable-views="['day', 'years', 'year']"
      :cell-click-hold="false"
      @cell-dblclick="click">
      <div slot="no-event"></div>
      <template v-slot:event="{ event }">
        <div>{{ event.title }}</div>
      </template>
    </vue-cal>
    <button @click="generateWeekMeal">Générer mes repas de la semaine</button>
  </div>
</template>

<script>
import VueCal from 'vue-cal'
import moment from 'moment'
import ModalVue from '../components/Modal.vue'
import 'vue-cal/dist/vuecal.css'
import 'vue-cal/dist/i18n/fr'
import Recipes from '../services/Recipe'
import PromiseB from 'bluebird'
import Events from '../services/EventsCalendar'
import MultiselectVue from '../components/Multiselect.vue'
moment.locale('fr')
export default {
  components: {
    VueCal,
    ModalVue,
    multiselect: MultiselectVue
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
    this.allRecipes = await Recipes.getRecipes()
    this.loadEvents()
  },
  methods: {
    async generateWeekMeal() {
      const today = moment();
      const from_date = today.startOf('week');
      const events = []
      Array(7).fill(null).forEach((_, i) => {
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
        this.$set(this.current, 'recipeId', null)
        this.$set(this.current, 'title', null)
      } else {
        this.$set(this.current, 'recipeId', recipes[0]._id)
        this.$set(this.current, 'title', recipes[0].name)
      }
    },
    click($event) {
      const $start = moment($event)
      $start.set({h: $start.hours() <= 19 && $start.hours() !== 0 ? 12 : 19, minutes: 0, seconds: 0})

      this.current = {
        title: '',
        content: '',
        class: 'blue-event',
      }
      this.$set(this.current, 'start', $start.format('YYYY-MM-DD HH:mm'))
      this.$set(this.current, 'end', $start.add(7, 'hours').format('YYYY-MM-DD HH:mm'))
      
      this.$refs.createModal.open().subscribe(async res => {
        if(!res) return
        await Events.createEvent(this.current)
        this.loadEvents()
      })
    },
    clickEvent($event) {
      console.log($event)

    }
  }
}
</script>

<style lang="scss">
/* Green-theme. */
.vuecal__title-bar {background-color: var(--headerBgColor)}
.vuecal__view-btn.vuecal__view-btn--active {
  border-bottom: 3px solid var(--headerBgColorAccent)
}
.vuecal__flex.vuecal__menu {
  box-shadow: 0 0 10px 0 black;
}
</style>