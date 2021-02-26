import dayjs from "dayjs"

export default {
  getDatesBetweenDates: (startDate, endDate) => {
    let dates = []
    //to avoid modifying the original date
    const theDate = new Date(startDate)
    while (theDate < endDate) {
      dates.push(dayjs(new Date(theDate)).startOf('day'))
      theDate.setDate(theDate.getDate() + 1)
    }
    return dates
  }
}