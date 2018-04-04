'use strict'

const DEBUG = true

const EVAC_OPTION_DRIVE = 'drive'
const EVAC_OPTION_WALK = 'walk'

const DEFAULT_ZOOM = 13
const DEFAULT_LOCATION = {lat: -43.57032122469974, lng: 172.755133778481479}
const OPENSTREET_TEMPLATE = {
  URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  OPTIONS: {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20
  }
}

const GOOGLESTREET_TEMPLATE = {
  URL: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  OPTIONS: {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }
}
/*Take same coordinates's order given from GeoJSON file.ex: [172.740839757922146,-43.562543510134788 ]*/
const INUNDATION_DATA = [
  {
    'type': 'Feature',
    'properties': {'ID': 1820, 'GRIDCODE': 4},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [-43.562312600853865, 172.7426978366654, ],
        [-43.562313896426801, 172.743274162037409 ],
        [-43.562411141407424,172.743153932775186 ],
        [-43.562312600853865, 172.7426978366654]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1822, 'GRIDCODE': 6},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [-43.562453749645087,172.740963964842081],
        [-43.56254379074079,172.740963579056313],
        [-43.562543510134788,172.740839757922146],
        [-43.562308406416243,172.740840765713926],
        [-43.56230868701995,172.74096458636663],
        [-43.562453749645087,172.740963964842081 ]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1823, 'GRIDCODE': 11},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [-43.562474412853241,172.750250541108016, ],
        [-43.562474142305391,172.7501267200266, ],
        [-43.562564183464836,172.750126347886692 ],
        [ -43.56252060406684,172.749459139137059],
        [-43.562327765557896, 172.749526803913881],
        [-43.562329350124052,172.750251140351168 ],
        [-43.562474412853241, 172.750250541108016]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1824, 'GRIDCODE': 10},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [-43.56256445401354, 172.750250169152508],
        [-43.562564183464836, 172.750126347886692],
        [-43.562474142305391, 172.7501267200266],
        [ -43.562474412853241, 172.750250541108016],
        [-43.56256445401354,172.750250169152508]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1825, 'GRIDCODE': 4},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [172.740839757922146,-43.562543510134788 ],
        [172.740839371950187,-43.562633551228188 ],
        [172.740715550633411, -43.562633270487218],
        [172.740716945063014, -43.562308125678442],
        [172.740840765713926,-43.562308406416243 ],
        [172.740839757922146, -43.562543510134788]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1826, 'GRIDCODE': 5},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [172.740963193268811, -43.562633831835072],
        [172.740839371950187, -43.562633551228188],
        [172.740839757922146, -43.562543510134788],
        [172.740963579056313, -43.56254379074079],
        [172.740963193268811, -43.562633831835072]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1827, 'GRIDCODE': 7},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [-43.562544071212692,172.741087400192328 ],
        [-43.562634112307848,172.741087014589198 ],
        [-43.562633831835072,172.740963193268811 ],
        [-43.56254379074079,172.740963579056313 ],
        [-43.562453749645087,172.74096396484208, ],
        [-43.562454030116108,172.741087785793667, ],
        [-43.562544071212692,172.741087400192328, ]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1828, 'GRIDCODE': 9},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [172.750125975745107, -43.562654224622861],
        [172.750126347886692, -43.562564183464836],
        [172.750250169152508, -43.56256445401354],
        [172.750249797195295, -43.56265449517241],
        [172.750125975745107, -43.562654224622861]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1829, 'GRIDCODE': 6},
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [[[
        [172.741086628984277, -43.562724153401575],
        [172.740962807479491, -43.562723872927926],
        [172.740963193268811, -43.562633831835072],
        [172.741087014589198, -43.562634112307848],
        [172.741086628984277, -43.562724153401575]
      ]]]
    }
  },
  {
    'type': 'Feature',
    'properties': {'ID': 1830, 'GRIDCODE': 8},
    'geometry': {'type': 'MultiPolygon', 'coordinates': [[[[172.741210450490854, -43.562724433741138 ], [ 172.741086628984277, -43.562724153401575 ], [ 172.741087014589198, -43.562634112307848 ], [ 172.741087400192328, -43.562544071212692 ], [ 172.741211221330104, -43.562544351550493 ], [ 172.741210450490854, -43.562724433741138 ] ] ] ] } },
      {'type': 'Feature',
      'properties': {'ID': 1, 'GRIDCODE': 7},
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[
          [-43.357085036152675, 172.711975524769542],
          [-43.35708441435419, 172.71172872023115],
          [-43.356994370230474, 172.711729146488977],
          [-43.35699561329097, 172.712222754843822],
          [-43.357085657418587, 172.712222329315864],
          [-43.357085036152675, 172.711975524769542]
        ]]]
      }
    },
    {
      'type': 'Feature',
      'properties': {'ID': 2, 'GRIDCODE': 8},
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[
          [-43.358166186838659, 172.71221722282678 ],
          [-43.358068500011697, 172.711954829681616 ],
          [-43.357854483250371, 172.712189486604643 ],
          [-43.357715659320078, 172.712097385616971 ],
          [-43.357580820663891, 172.712188422523099],
          [-43.357445526965797, 172.712098662777322 ],
          [-43.357266166075277, 172.712219758973731 ],
          [-43.357175080276917, 172.711975098874689],
          [-43.357085036152675, 172.711975524769542],
          [-43.357085657418587, 172.712222329315864],
          [-43.35699561329097, 172.712222754843822 ],
          [-43.35699592372324, 172.712346156937457 ],
          [-43.357131090579095, 172.712437438633259 ],
          [-43.357266059722875, 172.712346319487835 ],
          [-43.357446451039202, 172.712465994601132 ],
          [-43.357581289921825, 172.712374958510907 ],
          [-43.357716583402144, 172.712464719070226 ],
          [-43.357896368563132, 172.712343342001645 ],
          [ -43.35807633443882, 172.712462741656452],
          [-43.358166186838659, 172.71221722282678 ]
        ]]]
      }
    },
    {
      'type': 'Feature',
      'properties': {'ID': 3, 'GRIDCODE': 0},
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [[[
          [-43.365625731546508,172.706628014602927],
          [-43.365925167586674,172.706576363735479],
          [-43.365848395592984,172.706216330036511],
          [-43.365663086833266,172.706360946947427],
          [-43.365625731546508,172.706628014602927]
        ]]]
      }
    },
  {
    'type': 'Feature',
    'properties': {'ID': 4, 'GRIDCODE': 1},
    'geometry': {
      'type': 'MultiPolygon', 'coordinates': [[[
        [-43.368587301871997,172.702787502782797],
        [-43.368556085904544,172.702637168291432],
        [-43.368477408498578,172.702745784651796],
        [-43.368587301871997,172.702787502782797]
      ]]]
    }
  }
]

const INUNDATION_OPTIONS = {
  style: {
    'color': '#f03',
    'opacity': 0.65
  }
}

let _map

let mapInstance = function () {
  if (!_map) {
    _map = L.map('survive_map')
    log('map initialized')
  }
  return _map
}

function initializeMap () {
}

function loadInundationMap () {
  mapInstance().setView(DEFAULT_LOCATION, DEFAULT_ZOOM)
  log('map initialized with default view and options')

  L.tileLayer(OPENSTREET_TEMPLATE.URL, OPENSTREET_TEMPLATE.OPTIONS).addTo(mapInstance())
  log('loaded tile at [' + DEFAULT_LOCATION.lat + ', ' + DEFAULT_LOCATION.lng + ']')

  new L.GeoJSON(INUNDATION_DATA, INUNDATION_OPTIONS).addTo(mapInstance())
  log('loaded inundation data')
}

function locateCurrentPossition () {
  mapInstance().locate({setView: true, maxZoom: DEFAULT_ZOOM})

  L.tileLayer(GOOGLESTREET_TEMPLATE.URL, GOOGLESTREET_TEMPLATE.OPTIONS).addTo(mapInstance())

  mapInstance().locate({
    setView: true,
    maxZoom: 16,
    watch: true,
    timeout: 60000
  })

  function onLocationFound (e) {
    let radius = e.accuracy / 2
    L.marker(e.latlng).addTo(mapInstance())
      .bindPopup('You are within ' + radius + ' meters from this point').openPopup()
    L.circle(e.latlng, radius).addTo(mapInstance())

    //TODO: getEvacFromCurrentPosition
  }

  mapInstance().on('locationfound', onLocationFound)

}

function locateBySearchResult () {
  log('locateBySearchResult')
}

function log (msg) {
  if (DEBUG) console.log(msg)
}

function alert (msg) {
  alert(msg)
}

function getEvacFromCurrentPosition (leafletCoordinat) {
  $.post('/evac', leafletCoordinat, (evac, status) => {
    if (status != 'success') {
      alert('chung toi khong biet duong chay nao cho ban')
    } else {
      drawEvac(evac)
    }
  })
}

function getEvacFromId (evacId) {
  let params = {id: evacId} //getCurrentCoorFromBrowser();
  if (DEBUG)
    params = {address: '68 Nguyen Co Thach'}

  $.post(`/evac/$evacId`, (evac, status) => {
    if (status != 'success') return
    drawEvac(evac)
  })
}

function drawEvac (evac) {
  let zoom = DEFAULT_ZOOM

  mapInstance().setView([evac.addressGPS.x, evac.addressGPS.y], zoom)

  let evacOption = EVAC_OPTION_DRIVE
  if (evacOption === EVAC_OPTION_DRIVE) {
    drawPolyLine(evac.drive, mapInstance())
    // TODO: showEvactimeEstimated(evac.driveTimeEstimated)
  }
  else {
    drawPolyLine(evac.walk, mapInstance())
    // TODO: showEvactimeEstimated(estimateWalkEvacTime(evac.walk, ))

  }

  // tham số đầu là url template, thằng Leaf sẽ tự thay `Zoom` vào {z}, kinh độ vĩ
  // độ vào {x} và {y}, {s} thì có thể ko cần quan tâm, nhưng từ những tham số đó nó sẽ lấy dc các tấm ảnh bản đồ và "lát" vào div,
  // mỗi khi các tham số thay đổi thì nó lấy lại các ảnh khác
  //
  // chỗ này cũng để ngỏ khả năng mình thay {x} và {y} bằng thông số mình muốn
  if (DEBUG) console.log('loading tile at [' + evac.x + ', ' + evac.y + ']')
  let urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  let tileLayerOptions = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }
  L.tileLayer(urlTemplate, tileLayerOptions).addTo(mapInstance())

  L.marker([evac.x, evac.y])
    .addTo(mapInstance())
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup()

  let evacLineCoor = {x: evac.x - 0.009, y: evac.y + 0.025}
  let evacLineStyle = {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
  }
  //circle change to line
  let evacLine = L.polyline([evacLineCoor.x, evacLineCoor.y], evacLineStyle)
    .addto(mapInstance())
  let redAlert = L.circle([evacLineCoor.x, evacLineCoor.y], redAlertStyle)
    .addTo(mapInstance())

  let yellowAlertCoors = [{x: 51.509, y: -0.08}, {x: 51.503, y: -0.06}, {
    x: 51.51,
    y: -0.047
  }]
  let yellowAlertStyle = {
    color: 'yellow',
    fillColor: '#ff3',
    fillOpacity: 0.5,
    radius: 500
  }

  // giải thích về `yellowAlertCoors.map(coor => [coor.x, coor.y]`: L.mapInstance() là phương thức của các đối tượng
  // mảng, phương thức này trả về một mảng có độ dài tương đương với mảng cũ, bằng cách "convert" mỗi
  // phần tử của mảng cũ thành một phần tử mới, theo cách được mô tả trong tham số của nó:
  // yellowAlertCoors.map(function(coor) { return [coor.x, coor.y] })
  //
  // đoạn `function(coor) { return [coor.x, coor.y] }` có thể được viết tắt như dưới đây
  let yellowAlert = L.polygon(yellowAlertCoors.map(coor => [coor.x, coor.y]), yellowAlertStyle).addTo(mapInstance())
}

function drawPolyLine (points, map) {
  let lats = points.map(point => new L.LatLng(point.x, point.y))

  let firstpolyline = new L.Polyline(lats, {
    color: 'red',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
  })
  firstpolyline.addTo(map)
}

function searchAdd (feature, map) {
  let featuresLayer = new L.GeoJSON(data, {
    style: function (feature) {
      return {color: feature.properties.color}
    },
    onEachFeature: function (feature, marker) {
      marker.bindPopup('<h4 style="color:' + feature.properties.color + '">' + feature.properties.name + '</h4>')
    }
  })
}

// map.addLayer(featuresLayer)
// let searchControl = new L.Control.Search({
//   layer: featuresLayer,
//   propertyName: 'name',
//   marker: false,
//   moveToLocation: function (latlng, title, map) {
//     //map.fitBounds( latlng.layer.getBounds() );
//     let zoom = map.getBoundsZoom(latlng.layer.getBounds())
//     map.setView(latlng, zoom) // access the zoom
//   }
// })
// searchControl.on('search:locationfound', function (e) {
//
//   //console.log('search:locationfound', );
//   //map.removeLayer(this._markerSearch)
//   e.layer.setStyle({fillColor: '#3f0', color: '#0f0'})
//   if (e.layer._popup)
//     e.layer.openPopup()
// }).on('search:collapsed', function (e) {
//   featuresLayer.eachLayer(function (layer) {	//restore feature color
//     featuresLayer.resetStyle(layer)
//   })
// })
//
// map.addControl(searchControl)  //inizialize search control
//
// }