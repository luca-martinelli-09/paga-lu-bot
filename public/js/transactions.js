const toReceiveList = document.getElementById("toReceive");
const toSendList = document.getElementById("toSend");
const soldList = document.getElementById("sold");

getTransactions();

function getTransactions() {
  $.ajax({
    method: "POST",
    url: "/myTransactions",
    data: { data: app.initData },
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    success: (data) => {
      const toReceive = data.toReceive || [];
      const toSend = data.toSend || [];
      const sold = data.sold || [];

      fillList(toReceiveList, toReceive)
      fillList(toSendList, toSend)
      fillList(soldList, sold)
    },
  })
}

function soldTransaction(transactionID, sender, asset) {
  $.ajax({
    method: "POST",
    url: "/soldTransaction",
    data: { data: app.initData, transaction: transactionID, sender, asset },
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    statusCode: {
      200: () => {
        app.showAlert("🎉 Fatto!")
        getTransactions()
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

function fillList(list, data) {
  list.innerHTML = data.length > 0 ? "" : "<span class='hint text-sm p-4 bg-primary'>🥺 Qui non c'è niente</span>"

  for (const transaction of data) {
    const toSend = app.initDataUnsafe.user.id === transaction.SenderID;

    const transactionItem = document.createElement("li");
    transactionItem.dataset.ID = transaction.IDTransaction;
    transactionItem.dataset.SenderID = transaction.SenderID;
    transactionItem.dataset.AssetName = transaction.AssetName;
    transactionItem.dataset.AssetIcon = transaction.AssetIcon;

    transactionItem.innerText = transaction.AssetIcon + " " + transaction.AssetName;
    transactionItem.classList.add("user-card");
    transactionItem.classList.add("disabled");

    const subTitle = document.createElement("span");
    subTitle.classList.add("uc-sub");
    subTitle.innerText = toSend ? "a @" + transaction.ReceiverUsername : "da @" + transaction.SenderUsername;
    transactionItem.appendChild(subTitle);

    if (!toSend && !transaction.Payed) {
      transactionItem.classList.remove("disabled");

      transactionItem.addEventListener("click", (e) => {
        const data = e.target.dataset;

        app.showConfirm("Stai per saldare una transazione. Confermi?", function (confirmed) {
          if (confirmed)
            soldTransaction(data.ID, { id: data.SenderID }, { name: data.AssetName, icon: data.AssetIcon });
        })
      })
    }

    list.appendChild(transactionItem)
  }
}