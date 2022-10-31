CREATE TABLE IF NOT EXISTS Users (
  ID BIGINT NOT NULL,
  Username VARCHAR(300) DEFAULT NULL,
  Name VARCHAR(500) DEFAULT NULL,
  Surname VARCHAR(500) DEFAULT NULL,

  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS SavedUsers (
  ID BIGINT NOT NULL,
  IDSaved BIGINT NOT NULL,

  PRIMARY KEY (ID, IDSaved),
  FOREIGN KEY (ID) REFERENCES Users(ID),
  FOREIGN KEY (IDSaved) REFERENCES Users(ID)
);

CREATE TABLE IF NOT EXISTS Assets (
  ID VARCHAR(100) NOT NULL,
  Name VARCHAR(300) NOT NULL,
  Icon VARCHAR(20) DEFAULT NULL,
  AssetGroup VARCHAR(100) NOT NULL,

  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS Transactions (
  ID BIGINT AUTO_INCREMENT NOT NULL,
  Sender BIGINT NOT NULL,
  Receiver BIGINT NOT NULL,
  Asset VARCHAR(100) NOT NULL,
  Sent DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Payed DATETIME DEFAULT NULL,

  PRIMARY KEY (ID),
  FOREIGN KEY (Sender) REFERENCES Users(ID),
  FOREIGN KEY (Receiver) REFERENCES Users(ID),
  FOREIGN KEY (Asset) REFERENCES Assets(ID)
);

INSERT INTO Assets VALUES
  ('birra', 'Birra', '🍺', 'Bevande'),
  ('bubble-tea', 'Bubble Tea', '🧋', 'Bevande'),
  ('drink', 'Drink', '🥃', 'Bevande'),
  ('spritz', 'Spritz', '🍹', 'Bevande'),
  ('burrito', 'Burrito', '🌯', 'Cibo'),
  ('pasta', 'Pasta', '🍝', 'Cibo'),
  ('patatine', 'Patatine', '🍟', 'Cibo'),
  ('pizza', 'Pizza', '🍕', 'Cibo'),
  ('piadina', 'Piadina', '🌮', 'Cibo'),
  ('popcorn', 'Popcorn', '🍿', 'Cibo'),
  ('sushi', 'Sushi', '🍣', 'Cibo'),
  ('taco', 'Taco', '🌮', 'Cibo'),
  ('panino', 'Panino', '🍔', 'Cibo'),
  ('biscotto', 'Biscotto', '🍪', 'Dolci'),
  ('donut', 'Donut', '🍩', 'Dolci'),
  ('gelato', 'Gelato', '🍦', 'Dolci'),
  ('waffle', 'Waffle', '🧇', 'Dolci');