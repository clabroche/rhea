import API from './API'
import Auth from './Auth'
/**
 * 
 * @param {EventsCalendar} event 
 */
// @ts-ignore
// eslint-disable-next-line no-unused-vars
function EventsCalendar(event = {}) {
  this._id = event._id || null
  this.title = event.title || ""
  this.recipeId = event.recipeId || ""
  this.start = event.start || ""
  this.end = event.end || ""
  this.class = event.class || ""
  this.content = event.content || ""
  this.recipes = event.recipes || []
}


EventsCalendar.getEvents = async function () {
  const { data: events } = await API.get('/events/', {
    headers: { token: Auth.token },
  })
  return events.map(event => new EventsCalendar(event))
} 
EventsCalendar.get = async function (eventId) {
  if(!eventId) throw new Error('eventId param missing')
  const { data: event } = await API.get('/events/'+eventId, {
    headers: { token: Auth.token },
  })
  return new EventsCalendar(event)
}
EventsCalendar.createEvent = async function (eventToCreate) {
  if (!eventToCreate) throw new Error('eventToCreate param missing')
  await API.post('/events', eventToCreate, {
    headers: { token: Auth.token },
  })
}

EventsCalendar.deleteEvent = async function (eventId) {
  if (!eventId) throw new Error('eventId param missing')
  await API.delete('/events/' + eventId, {
    headers: { token: Auth.token },
  })
} 


export default EventsCalendar
