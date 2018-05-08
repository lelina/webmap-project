'use strict'
require('dotenv').config()

const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv)

const StreamArray = require('stream-json/utils/StreamArray')

let DriveEvac = require('./models/drive_evac')
let WalkEvac = require('./models/walk_evac')

let walk_count = 0
let drive_count = 0

mongoose.connect(`${process.env.MONGO}/webmap-production`)
  .then(() => {
    /***
     * bỏ dữ liệu cũ
     */
    argv.e === 'walk'
      ? WalkEvac.collection.drop() && WalkEvac.collection.dropIndexes()
      : DriveEvac.collection.drop() && DriveEvac.collection.dropIndexes()

    /***
     * Chúng ta sẽ chạy file seed này bằng lệnh `node seed.js -e walk -i walk.json`,
     * hoặc `node seed.js -e drive -i drive.json`
     * Hoặc bằng run configuration như ảnh anh gửi, trong câu lệnh dưới đây, `argv.e`
     * sẽ có giá trị `walk` hoặc `drive`, và `argv.i` sẽ có giá trị `walk.json` hoặc
     * `drive.json`
     */
    seedEvacs(argv.e, argv.i)
  })

function seedEvacs (mode, source) {
  let filepath = path.join(__dirname, source)
  let stream = mode === 'walk' ? createWalkEvacsStream() : createDriveEvacsStream()
  fs.createReadStream(filepath).pipe(stream.input)
}

function createDriveEvacsStream () {
  let stream = StreamArray.make()

  stream.output
    .on('data', (data) => {
      new DriveEvac(parseEvac(data.value, true)).save((err, result) => {
        if (!!err) log(err)
        else log(`seeded drive ${drive_count++}`)
      })
    }).on('end', () => log('reached end of stream!'))

  return stream
}

function createWalkEvacsStream () {
  let stream = StreamArray.make()

  stream.output
    .on('data', (data) => {
      new WalkEvac(parseEvac(data.value)).save((err, result) => {
        if (!!err) log(err)
        else log(`seeded walk ${walk_count++}`)
      })
    }).on('end', () => log('reached end of stream!'))

  return stream

}

function parseEvac (data, isDrive) {
  let evac = {
    forAddress: data['properties']['FULLADD'],
    length: data['properties']['LENGTH_GEO'],
  }

  if (isDrive) {
    evac.location = toLocation(data['geometry']['coordinates'][0])
    evac.points = data['geometry']['coordinates'].map(pair => toLocation(pair))
    evac.timeEstimated = data['properties']['Minute']
  } else {
    evac.location = toLocation(data['geometry']['coordinates'][0][0])
    evac.points = data['geometry']['coordinates'][0].map(pair => toLocation(pair))

  }

  return evac
}

function toLocation (array) {
  return {
    type: 'Point',
    coordinates: [array[0], array[1]]
  }
}

function log (msg) {
  console.log(`SEEDER: ${msg}`)
}
