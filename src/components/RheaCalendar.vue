<template>
  <div class="header">
    <div class="previous" @click="setWeek(week - 1)">
      <i class="fas fa-chevron-left"></i>
    </div>
    <div class="date">
      <div class="week">Semaine {{week}}</div>
      <div class="month">({{monthName}} {{year}})</div>
    </div>
    <div class="next" @click="setWeek(week + 1)">
      <i class="fas fa-chevron-right"></i>
    </div>
  </div>
  <div class="calendar">
    <div class="day" v-for="date of dates" :key="date">
      <div class="cell label">
        <div class="day-name">{{date.day.format('dddd')}}</div>
        <div class="day-number">{{date.day.format('DD/MM')}}</div>
      </div>
      <div class="cell morning" @click="$emit('click-morning', date)">
        {{date.eventMorning?.title}}
      </div>
      <div class="cell afternoon" @click="$emit('click-afternoon', date)">
        {{date.eventAfternoon?.title}}
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import 'dayjs/locale/fr'
import date from '../helpers/date'
dayjs.locale('fr')
dayjs.extend(weekOfYear)
export default {
  props: {
    events: {default: () => ([])}
  },
  setup(props, component) {
    const dateNow = ref(dayjs()) 
    const week = computed(() => dateNow.value.week())
    const monthName = computed(() => dateNow.value.format('MMMM'))
    const year = computed(() => dateNow.value.get('year'))

    const dates = computed(() => {
      const dates = date.getDatesBetweenDates(dateNow.value.startOf('week'), dateNow.value.endOf('week'))
      return dates.map(date => ({
        day: dayjs(date),
        eventMorning: props.events.filter(ev => {
          return dayjs(ev.start).get('hour') === 12
            && dayjs(date).format('YYYY/MM/DD') === dayjs(ev.start).format('YYYY/MM/DD')
        }).pop(),
        eventAfternoon: props.events.filter(ev => {
          return dayjs(ev.start).get('hour') === 19
            && dayjs(date).format('YYYY/MM/DD') === dayjs(ev.start).format('YYYY/MM/DD')
        }).pop(),
      }))
    })
    return {
      dateNow,
      monthName,
      week,
      year,
      dates,
      setWeek(week) {
        dateNow.value = dateNow.value.week(week)
        component.emit('change-date', dateNow.value.startOf('week'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  padding: 10px;
}
.day {
  display: flex;
  width: 100%;
  height: 80px;
  .cell {
    width: 33%;
    padding: 10px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgb(211, 211, 211);
    text-align: center;
    .day-number {
      font-size: 0.8em;
    }
    .day-name {
      font-weight: bold;
      margin-bottom: 5px;
      color: #616161
    }
  }
}
</style>