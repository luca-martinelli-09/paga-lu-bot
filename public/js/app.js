const app = window.Telegram.WebApp
app.BackButton.hide()

const errorScreen = document.getElementById("error")
const loadingScreen = document.getElementById("loading")

$.ajax({
  method: "POST",
  url: "/checkInitData",
  data: { data: app.initData },
  dataType: "json",
  xhrFields: {
    withCredentials: true
  },
  statusCode: {
    200: () => {
      loadingScreen.classList.add("hidden");
      app.ready();
    },
    418: () => {
      errorScreen.classList.remove("hidden")
      errorScreen.classList.add("flex")
    }
  }
})