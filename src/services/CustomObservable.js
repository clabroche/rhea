
function CustomObservable() {
  this.funcs = []
}
CustomObservable.prototype.subscribe = function (fun) {
  this.funcs.push(fun)
}
CustomObservable.prototype.next = function (...value) {
  this.funcs.map(f => f(...value))
}

export default CustomObservable