function loadMap () {
  let debug = true;

  if (debug) console.log('loading map')


  let currentCoor =  ""; //getCurrentCoorFromBrowser();
  if (debug)
    currentCoor = {address: "68 Nguyen Co Thach"};

  $.post('/c', currentCoor, (data, status) => {

    if (status != 'success') return

    const DEFAULT_ZOOM = 13

    // Schema:
    // {
    //   forAddress: String,
    //   addressGPS:
    //   {
    //     x: Number,
    //     y: Number
    //   },
    //   length: Number,
    //   points: [{x: Number, y: Number}]
    // }
    let evac = data
    let zoom = DEFAULT_ZOOM
    let map = L.map('survive_map').setView([evac.addressGPS.x, evac.addressGPS.y], zoom)

    drawPolyLine(evac.points, map)

    // tham số đầu là url template, thằng Leaf sẽ tự thay `Zoom` vào {z}, kinh độ vĩ
    // độ vào {x} và {y}, {s} thì có thể ko cần quan tâm, nhưng từ những tham số đó nó sẽ lấy dc các tấm ảnh bản đồ và "lát" vào div,
    // mỗi khi các tham số thay đổi thì nó lấy lại các ảnh khác
    //
    // chỗ này cũng để ngỏ khả năng mình thay {x} và {y} bằng thông số mình muốn
    if (debug) console.log('loading tile at [' + evac.x + ', ' + evac.y + ']')
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
    let evacLine= L.polyline ([evacLineCoor.x, evacLineCoor.y], evacLineStyle)
      .addto(map)
    let redAlert = L.circle([evacLineCoor.x, evacLineCoor.y], redAlertStyle)
      .addTo(map)

    var yellowAlertCoors = [{x: 51.509, y: -0.08}, {x: 51.503, y: -0.06}, {
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
  })

}


function drawPolyLine(points, map) {
  let lats = points.map(point => new L.LatLng(point.x, point.y))

  var firstpolyline = new L.Polyline(lats, {
    color: 'red',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
  });
  firstpolyline.addTo(map);
}