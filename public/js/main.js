'use strict'

const DEBUG = true

const EVAC_OPTION_DRIVE = 'drive'
const EVAC_OPTION_WALK = 'walk'

const DEFAULT_ZOOM = 17
const DEFAULT_LOCATION = {lat: -43.57643167342933, lng: 172.76022442275394}
let crLat = DEFAULT_LOCATION.lat
let crLng = DEFAULT_LOCATION.lng
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

const INUNDATION_OPTIONS = {
  style: {
    'color': '#f61a1a', 
    'opacity': 0.65
  }
}

const DRIVE_EVAC_OPTIONS = {

  style: {
    'color': '#0a0',
    'opacity': 0.65
  }
}

const WALK_EVAC_OPTIONS = {

  style: {
    'color': '#f80',
    'opacity': 0.65
  }
}

let _map
let _inundation
let _driveEvac
let _walkEvac
let _openstreetMap
let _marker
let _googleMap
let map
let markerList = []
let markerCount = 0

function mapInstance () {
  if (!_map) {
    _map = L.map('survive_map')
    log('map initialized')
  }
  return _map
}

function inundationLayer () {
  if (!_inundation) {
    _inundation = new L.GeoJSON(INUNDATION_DATA, INUNDATION_OPTIONS)
    log('minundationLayer initialized')
  }
  return _inundation
}

function baseMapLayer () {
  return googlemapLayer()
}

function openstreetLayer () {
  if (!_openstreetMap) {
    _openstreetMap = new L.tileLayer(OPENSTREET_TEMPLATE.URL, OPENSTREET_TEMPLATE.OPTIONS)
    log('openstreet layer initialized')
  }
  return _openstreetMap
}
function googlemapLayer () {
  if (!_googleMap) {
    _googleMap = new L.tileLayer(GOOGLESTREET_TEMPLATE.URL, GOOGLESTREET_TEMPLATE.OPTIONS)
    log('googlemap layer initialized')
  }
  return _googleMap
}

function initializeMap () {
  map = mapInstance()
  map.scrollWheelZoom.disable()
  map.setView(DEFAULT_LOCATION, DEFAULT_ZOOM)
  newMarker(DEFAULT_LOCATION, 'default location')
  log('map initialized with default view and options')

  baseMapLayer().addTo(map)
  log('loaded tile at [' + DEFAULT_LOCATION.lat + ', ' + DEFAULT_LOCATION.lng + ']')

  inundationToggle()
}

function inundationToggle () {
  $('#inundationToggle').is(':checked') ? loadInundationMap() : hideInundationMap()
}

function loadInundationMap () {
  inundationLayer().addTo(map)
  log('added inundation layer')
}

function hideInundationMap () {
  inundationLayer().remove()
  log('hidden inundation layer')
}

function locateCurrentPosition () {
  map.locate({setView: true, maxZoom: DEFAULT_ZOOM})

  L.tileLayer(GOOGLESTREET_TEMPLATE.URL, GOOGLESTREET_TEMPLATE.OPTIONS).addTo(map)

  map.locate({
    setView: true,
    maxZoom: 16,
    watch: true,
    timeout: 60000
  })

  function onLocationFound (e) {
    let radius = e.accuracy / 2
    L.marker(e.latlng).addTo(map)
      .bindPopup('You are within ' + radius + ' meters from this point').openPopup()
    L.circle(e.latlng, radius).addTo(map)

    //TODO: getEvacFromCurrentPosition
  }

  map.on('locationfound', onLocationFound)

}

function log (msg) {
  if (DEBUG) console.log(msg)
}

function alert (msg) {
  alert(msg)
}
// use places.js to search
function initializeAddressLocator () {
  var placesAutocomplete = places({
    container: document.querySelector('#address-locator')
  })

  

  // placesAutocomplete.on('suggestions', handleOnSuggestions)
  // placesAutocomplete.on('cursorchanged', handleOnCursorchanged)
  placesAutocomplete.on('change', handleOnChange)

  // placesAutocomplete.on('clear', handleOnClear)

  function handleOnSuggestions (e) {
    e.suggestions.forEach(suggestion => {
      log('found \'' + suggestion.value + '\' at [' + suggestion.latlng.lat + ', ' + suggestion.latlng.lng + ']')
    })
  }

  function handleOnChange (e) {
    let suggestion = e.suggestion
    let latlng = suggestion.latlng
    let lat = suggestion.latlng.lat
    let lng = suggestion.latlng.lng
    log('pick \'' + suggestion.value + '\' at [' + lat + ', ' + lng + ']')
    moveMarker(latlng, suggestion.value)
    relocateMap(latlng) 
    crLat = lat
    crLng = lng   
  }

  
}

function newMarker (latlng, msg) {
  markerList[markerCount] = L.marker(latlng).bindTooltip(msg)
  markerList[markerCount].addTo(map)
  markerCount++
  log('new marker at new location at [' + latlng.lat + ', ' + latlng.lng)
}

function moveMarker (latlng, msg) {
  dropout(markerList.length)
  newMarker(latlng, msg)
}

function dropout (nFirstMarkers) {
  let deletedMarkers = markerList.splice(0, nFirstMarkers)
  deletedMarkers.forEach((marker) => {
    map.removeLayer(marker)
    log('removed marker at [' + marker._latlng.lat + ', ' + marker._latlng.lng)
  })  

}

function relocateMap (latlng) {
  map.setView(latlng, DEFAULT_ZOOM)
  log('relocated map to new location at [' + latlng.lat + ', ' + latlng.lng)

}

let foundOne = false
let responses = 0

function driveToggle() {
  $.post(`/drive/${crLat}/${crLng}`, (result, status) => {
    responses++
    if (status != 'success' && responses == 2) {
      log('Sorry! We have no route to show you')
    } else {
      if (!!result.failed && responses == 2) {
        log('Sorry! We have no route to show you')
        return
      }

      log('found drive!')
      log(result)
      let newLatLngArray = result.points[result.points.length-1].coordinates
      let newLatLngObj = {lat: newLatLngArray[0], lng: newLatLngArray[1]}
      newMarker(newLatLngObj, result.forAddress)
      relocateMap(newLatLngObj)
      let isDrive = true
      drawEvac([crLng, crLat], result.points, isDrive)
    }
  })
}

function walkToggle() {
  $.post(`/walk/${crLat}/${crLng}`, (result, status) => {
    responses++
    if (status != 'success' && responses == 2) {
      log('Sorry! We have no route to show you')
    } else {
      if (!!result.failed && responses == 2) {
        log('Sorry! We have no route to show you')
        return
      }

      log('found walk!')
      log(result)
      let newLatLngArray = result.points[result.points.length-1].coordinates
      let newLatLngObj = {lat: newLatLngArray[1], lng: newLatLngArray[0]}
      newMarker(newLatLngObj, result.forAddress)
      relocateMap(newLatLngObj)
      let isDrive = false
      drawEvac([crLng, crLat], result.points, isDrive)
    }
  })
}

function drawEvac (startPoint, points, isDrive) {
  let evacs = []
  evacs.push(startPoint)
  points.forEach(point => {
    evacs.push([point.coordinates[0], point.coordinates[1]])
  })
  let geo = {
    type: 'LineString',
    coordinates: evacs
  }

  if (isDrive) {
    if (!!_driveEvac) map.removeLayer(_driveEvac)
    _driveEvac = new L.GeoJSON(geo, DRIVE_EVAC_OPTIONS)
    _driveEvac.addTo(map)
  } else {
    if (!!_walkEvac) map.removeLayer(_walkEvac)
    _walkEvac = new L.GeoJSON(geo, WALK_EVAC_OPTIONS)
    _walkEvac.addTo(map)
  }

}