const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const filepath = path.join(__dirname, 'moviesData.db')

let movie_db = null
let director_db = null

app.use(express.json())

const CreateDb = async () => {
  try {
    movie_db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (error) {
    console.log(`error ocuured as ${error.messege}`)
    process.exit(1)
  }
}
CreateDb()

const convertdatatoobject = dbobject => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  }
}

const convertdirectordatatoobject = dbobject => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const code = `
    SELECT 
    movie_name
    FROM
    movie;`
  const data = await movie_db.all(code)
  response.send(
    data.map(ele => ({
      movieName: ele.movie_name,
    })),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const code = `
  INSERT  INTO
  movie(director_id,movie_name,lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}');`
  const data = await movie_db.run(code)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const code = `
  SELECT 
    *
  FROM
    movie
  WHERE
    movie_id=${movieId};`
  const data = await movie_db.get(code)
  response.send(convertdatatoobject(data))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const code = `
  UPDATE 
    movie
  SET 
    director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
  WHERE
    movie_id=${movieId};`
  const data = await movie_db.run(code)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const code = `
    DELETE FROM
      movie
    WHERE
      movie_id=${movieId};`
  const data = await movie_db.run(code)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const code = `
    SELECT 
      *
    FROM
      director;`
  const data = await movie_db.all(code)
  response.send(data.map(ele => convertdirectordatatoobject(ele)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const code = `
    SELECT 
      movie_name
    FROM
      movie
    WHERE
      director_id=${directorId};`
  const data = await movie_db.all(code)
  response.send(data.map(ele => ({movieName: ele.movie_name})))
})

module.exports = app
