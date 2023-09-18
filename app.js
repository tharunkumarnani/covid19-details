const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`Db Error Msg : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
//get players api

const changeCamelCase = (listArray) => {
  const newCamelCaseArray = listArray.map((each) => {
    return {
      playerId: each.player_id,
      playerName: each.player_name,
      jerseyNumber: each.jersey_number,
      role: each.role,
    };
  });
  return newCamelCaseArray;
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select * from cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  const updatedArray = changeCamelCase(playersArray);
  response.send(updatedArray);
});

//player add api

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
    INSERT into cricket_team 
    (player_name,jersey_number,role)
    values ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(createPlayerQuery);
  console.log("Created Player ID :", dbResponse.lastID);
  response.send("Player Added to Team");
});

//3. GET player api

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select * from cricket_team where player_id=${playerId};`;
  const playerArray = await db.get(getPlayerQuery);
  const updatedArray = changeCamelCase([playerArray]);
  response.send(updatedArray[0]);
});

//4.update Player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    update cricket_team
    set player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
        where player_id=${playerId};

    `;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//5.Delete Player Api

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from cricket_team 
    where player_id=${playerId};`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
