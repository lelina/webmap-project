const EVAC_OPTION_DRIVE = 'drive'
const EVAC_OPTION_WALK = 'walk'
const DEFAULT_ZOOM = 13
const DEBUG = true
function inundationMap(){
  'use strict'
  if (DEBUG) console.log('loading map')

  $.get('/', {address: ''}, (data, status) => {
    let coord=data
  let map = L.map('survive_map').setView([coord.x, coord.y], DEFAULT_ZOOM);
  if (DEBUG) console.log('loading tile at [' + coord.x + ', ' + coord.y + ']')
  let urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  let tileLayerOptions = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }
  })
  L.tileLayer(urlTemplate, tileLayerOptions).addTo(map)
  let inundation = [{
    "type": "FeatureCollection",
    "name": "inundationPolygonGeo",
    "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" },
    "geometry":{
      "type": "MultiPolygon",
      "coordinate": [
        [ -43.357085036152675, 172.711975524769542 ],
        [ -43.35708441435419, 172.71172872023115  ],
        [ -43.356994370230474 ,172.711729146488977 ],
        [ -43.35699561329097, 172.712222754843822 ],
        [-43.357085657418587,  172.712222329315864],
        [ -43.357085036152675, 172.711975524769542 ]
      ]
    }
  }]
  let inundationStyle={
    "color": "#0000ff",
    "opacity": 0.65
  }

  new L.GeoJSON(inundation, {
    style: inundationStyle
  }).addTo(map);
}



function locateCurrentPossition () {
  // log('locateCurrentPossition')
  // let isSupportedBrowser = navigator.geolocation
  // if (isSupportedBrowser) {
  //   navigator.geolocation.getCurrentPosition(getEvacFromCurrentPosition)
  // } else {
  //   alert('Geolocation is not supported by this browser.')
  // }

  let map = L.map('survive_map').locate({setView: true, maxZoom: DEFAULT_ZOOM});

  googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  }).addTo(map);

  map.locate({setView: true,
    maxZoom: 16,
    watch:true,
    timeout: 60000
  });

  function onLocationFound(e) {
    let radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
      .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(map);

    //TODO: getEvacFromCurrentPosition
  }

  map.on('locationfound', onLocationFound);

}

function locateBySearchResult () {
  log('locateBySearchResult')
}

function log (msg) {
  console.log(msg)
}

function alert(msg) {
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

  let map = L.map('survive_map').setView([evac.addressGPS.x, evac.addressGPS.y], zoom)

  let evacOption = EVAC_OPTION_DRIVE
  if (evacOption === EVAC_OPTION_DRIVE) {
    drawPolyLine(evac.drive, map)
    // TODO: showEvactimeEstimated(evac.driveTimeEstimated)
  }
  else {
    drawPolyLine(evac.walk, map)
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
  L.tileLayer(urlTemplate, tileLayerOptions).addTo(map)

  L.marker([evac.x, evac.y])
    .addTo(map)
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
    .addto(map)
  let redAlert = L.circle([evacLineCoor.x, evacLineCoor.y], redAlertStyle)
    .addTo(map)

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

  // giải thích về `yellowAlertCoors.map(coor => [coor.x, coor.y]`: map() là phương thức của các đối tượng
  // mảng, phương thức này trả về một mảng có độ dài tương đương với mảng cũ, bằng cách "convert" mỗi
  // phần tử của mảng cũ thành một phần tử mới, theo cách được mô tả trong tham số của nó:
  // yellowAlertCoors.map(function(coor) { return [coor.x, coor.y] })
  //
  // đoạn `function(coor) { return [coor.x, coor.y] }` có thể được viết tắt như dưới đây
  let yellowAlert = L.polygon(yellowAlertCoors.map(coor => [coor.x, coor.y]), yellowAlertStyle).addTo(map)
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

searchAddfunction searchAdd (feature, map) {
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