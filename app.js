const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
module.exports = app;

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
const convertToMovieName = (t) => {
  return {
    movieName: t.movie_name,
  };
};
app.get("/movies/", async (request, response) => {
  const q1 = `select * from movie;`;
  const check = await db.all(q1);
  //const { movie_name } = check;
  response.send(check.map((g) => convertToMovieName(g)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const q2 = `insert into movie(director_id,movie_name,lead_actor)
  values(
      '${directorId}',
      '${movieName}',
      '${leadActor}'
  );`;

  await db.run(q2);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const q1 = `select * from movie where movie_id=${movieId};`;

  const check1 = await db.get(q1);
  const { movie_id, director_id, movie_name, lead_actor } = check1;
  const obj = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  };
  response.send(obj);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const q1 = `update movie set
   director_id='${directorId}',
   movie_name='${movieName}',
   lead_actor='${leadActor}' where movie_id=${movieId};`;
  await db.run(q1);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //const { directorId, movieName, leadActor } = request.body;
  const q1 = `delete from movie where movie_id='${movieId}';`;
  await db.run(q1);
  response.send("Movie Removed");
});

const convertToObject = (e) => {
  return {
    directorId: e.director_id,
    directorName: e.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const q1 = `select * from director;`;
  const check1 = await db.all(q1);
  response.send(check1.map((e) => convertToObject(e)));
});

const convert = (e) => {
  return {
    movieName: e.movie_name,
  };
};
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const q1 = `select * from movie where director_id='${directorId}';`;
  const movies = await db.all(q1);
  //const {movie_name}=movies
  //const obj1={

  //}
  response.send(movies.map((f) => convert(f)));
});
