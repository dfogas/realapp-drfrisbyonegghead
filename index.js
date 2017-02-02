/* 
    zadanim je dostat navrhy muzikantu/kapel na zaklade zadani dvou jmen kapel jako parametru
    ex:
    node index.js blur oasis
    console.log(related artists to blur and oasis)

    "https://api.spotify.com/v1/search?q=${query}&type=artist"
    "https://developer.spotify.com/web-api/console/get-artist-related-artists"

    uděláme to čístě jako jednu pipelinu (no i když, těch definic je tam tak jako tak dost)

    Dotatek #1:
    funkce main byla změněna na použití pro 2 a více kapel
*/

const Task = require('data.task')
const Spotify = require('./spotify')
const { List } = require('immutable-ext')

const argv = new Task((rej, res) => res(process.argv))

const names = argv.map(args => args.slice(2))

const Intersection = xs =>
    ({
        xs,
	concat: ({xs: ys}) =>
	    Intersection(xs.filter(x => ys.some(y => y === x)))
    })

// this one is for two artists version
//const artistsIntersection = rels1 => rels2 => 
//    Intersection(rels1).concat(Intersection(rels2)).xs

const artistsIntersection = rels =>
    rels.foldMap(Intersection).xs

const related = (name) =>
    Spotify.findArtist(name)
    .map(artist => artist.id)
    .chain(Spotify.relatedArtists)
    .map(artists => artists.map(artist => artist.name))

// dodatek #1 version - I don't understand this shit...
const main = names =>
    List(names)
//  .map(related) // gets us list of tasks so instead we do
    .traverse(Task.of, related) // gets us Task of lists of artists
    .map(artistsIntersection) // combine lists of artists by Intersection

// using applicatives here
// and Task because there will be http.get involved
//const main = ([name1, name2]) =>
//    Task.of(rels1 => rels2 => [rels1, rels2])
//    .ap(related(name1))
//    .ap(related(name2))
// chtělo by to typovou anotaci (lonsdorf zminuje typechecker)...

names.chain(main).fork(console.error, console.log)
