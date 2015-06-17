/*globals google*/
var THREE = require('three')
var equirect = require('../')
var panorama = require('google-panorama-by-location')
var createOrbitViewer = require('three-orbit-viewer')(THREE)

var preloader = document.querySelector('.preloader')
var streetview = [ 51.50700703827454, -0.12791916931155356 ]
var photosphere = [ -21.203982, -159.83700899999997 ]
var service = new google.maps.StreetViewService()

var app = createOrbitViewer({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 50,
  position: new THREE.Vector3(0, 0, -0.1)
})

var texture = new THREE.Texture()
texture.minFilter = THREE.LinearFilter
texture.generateMipmap = false

// transparent canvas to start (white)
var canvas = document.createElement('canvas')
texture.needsUpdate = true
texture.image = canvas

// add a double-sided sphere
var geo = new THREE.SphereGeometry(1, 84, 84)
var mat = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.DoubleSide
})
var sphere = new THREE.Mesh(geo, mat)
app.scene.add(sphere)

// load a random panosphere / streetview
var location = Math.random() > 0.5 ? streetview : photosphere
panorama(location, {
  service: service
}, function (err, result) {
  if (err) throw err
  preloader.style.height = '4px'

  // load the equirectangular image
  equirect(result.id, {
    tiles: result.tiles,
    canvas: canvas,
    crossOrigin: 'Anonymous',
    zoom: 4
  })
    .on('complete', function (image) {
      texture.needsUpdate = true
      preloader.style.height = '0'
    })
    .on('progress', function (ev) {
      texture.needsUpdate = true
      preloader.style.width = ((ev.count / ev.total).toFixed(1) * 100) + '%'
    })
})