'use strict'
require('dotenv').config()

const mongoose = require('mongoose')
<<<<<<< HEAD
let Evac = require('./models/evac')

mongoose.connect('mongodb://binhsonnguyen.com:8000/webmap-production')


//TODO: Hỏi thầy về ASYNC JAVASCRIPT để export streamfile() ra một array thống nhất
function streamVehicleEvacFile(filePath) {
  const StreamArray = require('stream-json/utils/StreamArray');
  const path = require('path');
  const fs = require('fs');
  let jsonStream = StreamArray.make();
  // let output = []
  Evac.remove({}, function(err, result) {
    if (err) return console.log('Cannot remove all db in collection Evac: ' + err)
  })
//You'll get json objects here
  jsonStream.output.on('data', function ({index, value}) {
    let newEvac = new Evac({
      forAddress: value['properties']['FULLADD'],
      addressGPS: {
        x: value['geometry']['coordinates'][0][1],
        y: value['geometry']['coordinates'][0][0]
      },
      length: value['properties']['LENGTH_GEO'],
      driveTimeEstimated: value['properties']['Minute'],
      drive: value['geometry']['coordinates'].map(value => {
        return {x: value[1], y: value[0]}
      })
    })
    // output.push(newEvac)
    newEvac.save(function(err, result) {
      if (err) console.log(err)
    })
  });
  jsonStream.output.on('end', function () {
    console.log('YES!')
  });
  let filepath = path.join(__dirname, filename);
  fs.createReadStream(filePath).pipe(jsonStream.input);
  // return output
}

function streamWalkEvacFile(filePath) {
  const StreamArray = require('stream-json/utils/StreamArray');
  const path = require('path');
  const fs = require('fs');
  let jsonStream = StreamArray.make();
  // let output = []
  Evac.remove({}, function(err, result) {
    if (err) return console.log('Cannot remove all db in collection Evac: ' + err)
  })
//You'll get json objects here
  jsonStream.output.on('data', function ({index, value}) {
    let newEvac = new Evac({
      forAddress: value['properties']['FULLADD'],
      addressGPS: {
        x: value['geometry']['coordinates'][0][1],
        y: value['geometry']['coordinates'][0][0]
      },
      length: value['properties']['LENGTH_GEO'],
      driveTimeEstimated: value['properties']['Minute'],
      drive: value['geometry']['coordinates'].map(value => {
        return {x: value[1], y: value[0]}
      })
    })
    // output.push(newEvac)
    newEvac.save(function(err, result) {
      if (err) console.log(err)
    })
  });
  jsonStream.output.on('end', function () {
    console.log('YES!')
  });
  let filepath = path.join(__dirname, filename);
  fs.createReadStream(filePath).pipe(jsonStream.input);
  // return output
}

streamVehicleEvacFile('E:/coding/Javascript/Projects/webmap-project-json/AddVeAll.geojson')

=======
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
>>>>>>> 51fc40cdf6a3e49fca2a146758be0e91c9cd5a64
