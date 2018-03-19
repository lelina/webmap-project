function loadMap () {
  let debug = true;

  if (debug) console.log('loading map')

  $.get('/c', {address: '68 nguyen co thach'}, (data, status) => {
    if (status != 'success') return

    let coor = data
    let zoom = 13
    let map = L.map('survive_map').setView([coor.x, coor.y], zoom)

    // tham số đầu là url template, thằng Leaf sẽ tự thay `Zoom` vào {z}, kinh độ vĩ
    // độ vào {x} và {y}, {s} thì có thể ko cần quan tâm, nhưng từ những tham số đó nó sẽ lấy dc các tấm ảnh bản đồ và "lát" vào div,
    // mỗi khi các tham số thay đổi thì nó lấy lại các ảnh khác
    //
    // chỗ này cũng để ngỏ khả năng mình thay {x} và {y} bằng thông số mình muốn
    if (debug) console.log('loading tile at [' + coor.x + ', ' + coor.y + ']')
    let urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    let tileLayerOptions = {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }
    L.tileLayer(urlTemplate, tileLayerOptions).addTo(map)

    L.marker([coor.x, coor.y])
      .addTo(map)
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup()

    let redAlertCoor = {x: coor.x - 0.009, y: coor.y + 0.025}
    let redAlertStyle = {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
    }
    let redAlert = L.circle([redAlertCoor.x, redAlertCoor.y], redAlertStyle)
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