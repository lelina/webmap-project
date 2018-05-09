'use strict'

const DEBUG = true

const EVAC_OPTION_DRIVE = 'drive'
const EVAC_OPTION_WALK = 'walk'

const DEFAULT_ZOOM = 15
const DEFAULT_LOCATION = {lat: -43.57643167342933, lng: 172.76022442275394}
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
  return openstreetLayer()
}

function openstreetLayer () {
  if (!_openstreetMap) {
    _openstreetMap = new L.tileLayer(OPENSTREET_TEMPLATE.URL, OPENSTREET_TEMPLATE.OPTIONS)
    log('openstreet layer initialized')
  }
  return _openstreetMap
}

function initializeMap () {
  mapInstance().scrollWheelZoom.disable()
  mapInstance().setView(DEFAULT_LOCATION, DEFAULT_ZOOM)
  log('map initialized with default view and options')

  baseMapLayer().addTo(mapInstance())
  log('loaded tile at [' + DEFAULT_LOCATION.lat + ', ' + DEFAULT_LOCATION.lng + ']')

  inundationToggle()
}

function inundationToggle () {
  $('#inundationToggle').is(':checked') ? loadInundationMap() : hideInundationMap()
}

function loadInundationMap () {
  inundationLayer().addTo(mapInstance())
  log('added inundation layer')
}

function hideInundationMap () {
  inundationLayer().remove()
  log('hidden inundation layer')
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

  let map = mapInstance()

  placesAutocomplete.on('suggestions', handleOnSuggestions)
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

    let foundOne = false
    let responses = 0
    $.post(`/drive/${lat}/${lng}`, (result, status) => {
      responses++
      if (status != 'success' && responses == 2) {
        alert('Sorry! We have no route to show you')
      } else {
        if (!!result.failed && responses == 2) {
          alert('Sorry! We have no route to show you')
          return
        }

        log('found drive!')
        log(result)
        if (!foundOne) {
          if (!!_marker) dropout(_marker)
          moveMarker(latlng)
          relocateMap(latlng)
          foundOne = true
        }
        let isDrive = true
        drawEvac([lng, lat], result.points, isDrive)
      }
    })

    $.post(`/walk/${lat}/${lng}`, (result, status) => {
      responses++
      if (status != 'success' && responses == 2) {
        alert('Sorry! We have no route to show you')
      } else {
        if (!!result.failed && responses == 2) {
          alert('Sorry! We have no route to show you')
          return
        }

        log('found walk!')
        log(result)
        if (!foundOne) {
          if (!!_marker) dropout(_marker)
          moveMarker(latlng)
          relocateMap(latlng)
          foundOne = true
        }
        let isDrive = false
        drawEvac([lng, lat], result.points, isDrive)
      }
    })
  }

  function moveMarker (latlng) {
    _marker = L.marker(latlng, {opacity: 1})
    _marker.addTo(map)
    log('moved marker to new location at [' + latlng.lat + ', ' + latlng.lng)
  }

  function dropout (marker) {
    map.removeLayer(marker)
    log('removed marker at [' + marker._latlng.lat + ', ' + marker._latlng.lng)

  }

  function relocateMap (latlng) {
    map.setView(latlng, DEFAULT_ZOOM)
    log('relocated map to new location at [' + latlng.lat + ', ' + latlng.lng)

  }
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
    _driveEvac.addTo(mapInstance())
  } else {
    if (!!_walkEvac) map.removeLayer(_walkEvac)
    _walkEvac = new L.GeoJSON(geo, WALK_EVAC_OPTIONS)
    _walkEvac.addTo(mapInstance())
  }

}