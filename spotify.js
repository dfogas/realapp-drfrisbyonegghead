
/* 
    "https://api.spotify.com/v1/search?q=${query}&type=artist" // artists: {items:[]}}
    "https://api.spotify.com/v1/artists/${id}/related-artists" // artists: []
*/

const request = require('request')
const Task = require('data.task')
const Either = require('data.either')

const httpGet = url => 
    new Task((rej, res) =>
        request(url, (error, response, body) =>
            error ? rej(error) : res(body)))

const first = (xs) =>
    Either.fromNullable(xs[0])

const eitherToTask = e =>
    e.fold(Task.rejected, Task.of)
// because JSON.parse might throw an error and it does not work with async
// folktale version of pure safe version
const parse = Either.try(JSON.parse)

// Task Either Artist
const findArtist = name =>
    httpGet(`https://api.spotify.com/v1/search?q=${name}&type=artist`)
    .map(parse)
    .chain(eitherToTask)
    .map(result => result.artists.items)
    .map(first)
    .chain(eitherToTask)

const relatedArtists = id =>
    httpGet(`https://api.spotify.com/v1/artists/${id}/related-artists`)
    .map(parse)
    .chain(eitherToTask)
    .map(result => result.artists)

module.exports = { findArtist, relatedArtists }
