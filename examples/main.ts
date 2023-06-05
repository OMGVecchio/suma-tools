import { ExpiringLocalStorage } from '../packages/ExpiringLocalStorage/src/index'

const localStorage = new ExpiringLocalStorage()

localStorage.setItem("exampleKey", "exampleValue", 10);
console.log('exampleKey before', localStorage.getItem("exampleKey"))
setTimeout(() => {
    console.log('exampleKey after', localStorage.getItem("exampleKey"))
}, 1000)
