

const mongoose = require('mongoose')
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

