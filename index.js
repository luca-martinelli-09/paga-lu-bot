const config = require('./config')
const crypto = require('crypto');

const express = require("express");
const { createServer } = require("http");

const { createDBConnection } = require('./src/database')
const { bot, WEBAPP_RM } = require('./src/tgbot');

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');

const httpServer = createServer(app);

app.post(`/bot${config.telegram.api}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

function getUserData(data) {
  const encoded = decodeURIComponent(data);

  const arr = encoded.split('&');
  const hashIndex = arr.findIndex(str => str.startsWith('hash='));
  const hash = arr.splice(hashIndex)[0].split('=')[1];

  const userIndex = arr.findIndex(str => str.startsWith('user='));
  const user = arr[userIndex] ? JSON.parse(arr[userIndex].split('=')[1]) : null;

  return {
    arr,
    hash,
    user
  }
}

function verifyTelegram(data) {
  const { arr, hash } = getUserData(data);

  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join('\n');

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(config.telegram.api).digest()
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

  if (computedHash === hash) return true

  return false
}

app.post("/checkInitData", (req, res) => {
  const verifyTG = verifyTelegram(req.body.data);

  if (verifyTG) return res.sendStatus(200)
  res.sendStatus(418)
});

app.post("/sendAsset", (req, res) => {
  const verifyTG = verifyTelegram(req.body.data);
  if (!verifyTG) return res.sendStatus(418);

  const { user } = getUserData(req.body.data);

  const sender = user.id;
  const receiver = req.body.to;
  const asset = req.body.asset;

  const dbConnection = createDBConnection();
  dbConnection.query("insert into Transactions (Sender, Receiver, Asset) values (?, ?, ?)", [sender, receiver.id, asset.id], (error) => {
    if (error) return res.status(503).json({ error: error.sqlMessage })

    bot.sendMessage(receiver.id, asset.icon + " Hai ricevuto un/a " + asset.name.toLowerCase() + " da @" + user.username + "!", { reply_markup: WEBAPP_RM })

    return res.sendStatus(200)
  })
  dbConnection.end();
});

app.post("/soldTransaction", (req, res) => {
  const verifyTG = verifyTelegram(req.body.data);
  if (!verifyTG) return res.sendStatus(418);

  const { user } = getUserData(req.body.data);

  const transactionID = req.body.transaction;
  const sender = req.body.sender;
  const asset = req.body.asset;

  const dbConnection = createDBConnection();
  dbConnection.query("update Transactions set Payed = CURRENT_TIMESTAMP() where ID = ? and Receiver = ?", [transactionID, user.id], (error) => {
    if (error) return res.status(503).json({ error: error.sqlMessage })

    bot.sendMessage(sender.id, asset.icon + "🎉 Il tuo debito di un/a " + asset.name.toLowerCase() + " con @" + user.username + " è stato saldato!", { reply_markup: WEBAPP_RM })

    return res.sendStatus(200)
  })
  dbConnection.end();
});

app.post("/myTransactions", (req, res) => {
  const verifyTG = verifyTelegram(req.body.data);
  if (!verifyTG) return res.sendStatus(418);

  const { user } = getUserData(req.body.data);

  const dbConnection = createDBConnection();
  dbConnection.query(`select
          Transactions.ID as IDTransaction, Transactions.Payed as Payed, Transactions.Sent as Sent,
          Senders.ID as SenderID, Senders.Username as SenderUsername, Senders.Name as SenderName, Senders.Surname as SenderSurname,
          Receivers.ID as ReceiverID, Receivers.Username as ReceiverUsername, Receivers.Name as ReceiverName, Receivers.Surname as ReceiverSurname,
          Assets.ID as AssetID, Assets.Name as AssetName, Assets.Icon as AssetIcon, Assets.AssetGroup as AssetGroup
        from Transactions
        join Users as Senders on Senders.ID = Transactions.Sender
        join Users as Receivers on Receivers.ID = Transactions.Receiver
        join Assets on Assets.ID = Transactions.Asset
      where Transactions.Sender = ? or Transactions.Receiver = ?
      order by Transactions.Sent desc`,
    [user.id, user.id], (error, results) => {
      if (error) return res.status(503).json({ error: error.sqlMessage })

      const groupedTransactions = results.reduce((g, a) => {
        group = a.Payed != null ? "sold" : (a.SenderID === user.id ? "toSend" : "toReceive");

        g[group] = g[group] || [];
        g[group].push(a);
        return g;
      }, {});

      return res.json(groupedTransactions)
    })
  dbConnection.end();
});

app.get("/assets", (_, res) => {
  const dbConnection = createDBConnection();
  dbConnection.query("select * from Assets order by Name asc", (error, results, _) => {
    if (error) return res.status(503).json({ error: error.sqlMessage })
    return res.json(results)
  })
  dbConnection.end();
})

app.use("/send", (_, res) => {
  const dbConnection = createDBConnection();
  dbConnection.query("select * from Assets order by AssetGroup asc, Name asc", (error, results, _) => {
    if (error) return res.status(503).json({ error: error.sqlMessage })

    const groupedAssets = results.reduce((g, a) => {
      g[a.AssetGroup] = g[a.AssetGroup] || [];
      g[a.AssetGroup].push(a);
      return g;
    }, {});

    res.render("send", { groupedAssets: groupedAssets });
  })
  dbConnection.end();
});

app.use("/transactions", (_, res) => {
  res.render("transactions");
});

app.get("/users", (req, res) => {
  const query = '%' + decodeURI(req.query.q).toLowerCase() + '%';
  const filter = req.query.id

  const dbConnection = createDBConnection();
  dbConnection.query("select * from Users where (lower(Username) like ? or lower(Name) like ? or lower(Surname) like ?) and ID != ? order by Username asc", [query, query, query, filter], (error, results, _) => {
    if (error) return res.status(503).json({ error: error.sqlMessage })

    res.json(results);
  })
  dbConnection.end();
});

app.use("/", (_, res) => {
  res.render("index");
});

httpServer.listen(3000);