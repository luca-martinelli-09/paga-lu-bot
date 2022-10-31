const chooseScreen = document.getElementById("choose")
const sendScreen = document.getElementById("send")

const usersList = document.getElementById("usersList")

const assetID = document.getElementById("assetID")
const assetPic = document.getElementById("assetPic")
const assetName = document.getElementById("assetName")

function sendAsset(asset, user) {
  $.ajax({
    method: "POST",
    url: "/sendAsset",
    data: { data: app.initData, asset: asset, to: user },
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    statusCode: {
      200: () => {
        app.showAlert("🎉 Inviato!")
        app.close()
      },
      418: () => {
        app.showAlert("🤨 Sembra che tu non stia usando Telegram!")
      },
      503: () => {
        app.showAlert("😢 Oh no! C'è stato un errore")
      }
    }
  })
}

function listUsers(users) {
  usersList.innerHTML = users.length > 0 ? "" : "<span class='hint text-sm px-4'>🫠 Sembra che non ci sia nessuno, cerca altro o chiedi al tuo amico di avviare il bot</span>"

  for (const user of users) {
    const userItem = document.createElement("li");
    userItem.dataset.ID = user.ID;
    userItem.dataset.Username = user.Username;
    userItem.innerText = user.Username;
    userItem.classList.add("user-card");

    const subTitle = document.createElement("span");
    subTitle.classList.add("uc-sub");
    subTitle.innerText = ((user.Name || "") + " " + (user.Surname || "")).trim();
    userItem.appendChild(subTitle);

    userItem.addEventListener("click", (e) => {
      const user = e.target.dataset;

      app.showConfirm("Stai per inviare un/a " + assetID.dataset.name.toLowerCase() + " a @" + user.Username + ". Confermi?", function (confirmed) {
        if (confirmed)
          sendAsset({
            id: assetID.value,
            name: assetID.dataset.name,
            icon: assetID.dataset.icon
          }, {
            id: user.ID,
            username: user.Username
          });
      })
    })

    usersList.appendChild(userItem)
  }
}

$("#receiver").on('input', function () {
  const query = $(this).val().trim();

  if (query.length >= 3) {
    $.ajax({
      url: "/users?q=" + encodeURI(query) + "&id=" + app.initDataUnsafe.user.id,
      success: (data) => {
        listUsers(data)
      }
    })
  } else {
    usersList.innerHTML = ""
  }
});

$(".asset-card").click(function () {
  const img = $(this).find("img")

  assetID.value = $(this).data("id");
  assetID.dataset.icon = $(this).data("icon");
  assetID.dataset.name = $(this).data("name");

  assetPic.setAttribute("src", img.attr("src"));
  assetPic.setAttribute("alt", img.attr("alt"));
  assetName.innerText = $(this).data("name");

  sendScreen.classList.add("active");

  app.BackButton.show();
});

app.BackButton.onClick(() => {
  app.BackButton.hide();

  usersList.innerHTML = "";
  $("#receiver").val("");
  sendScreen.classList.remove("active");
});