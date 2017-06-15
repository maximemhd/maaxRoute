///////// GPX //////////////////
var gpx_data;

function readGPXFile(e) {
  var file = e.target.files[0];
  console.log("fichier ok");
  if (!file) {
    return;
  }
  if (file.name.substring(file.name.lastIndexOf('.')) != ".gpx") {
    //Alerte sur le format du fichier
    alert('Choisir un fichier .gpx !');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    load_gpx(contents);
    var data = calculs();

    //displayContents(contents);
  };
  reader.readAsText(file);
}
var name;

function load_gpx(contents) {
  //console.log(contents);
  gpx_data = toGeoJSON.gpx(jQuery.parseXML(contents));
  name = gpx_data.features[0].properties.name;
  console.log(gpx_data);
  var latlngs = [];
  var xtab = [];
  var ytab = [];
  var x, y;
  xmax = 0;
  ymax = 0;
  var init = 0;
  var points = new String('');

  for (var i = 0; i < gpx_data.features[0].geometry.coordinates.length; i++) {
    lon = gpx_data.features[0].geometry.coordinates[i][0];
    lat = gpx_data.features[0].geometry.coordinates[i][1];
    x = parseInt((300.0 / 360.0) * (180.0 + lon) * 8000);
    y = parseInt((200.0 / 180.0) * (90.0 - lat) * 8000); //height
    if (init == 0) {
      xmin = x;
      ymin = y;
      init = 1;
    }
    if (x > xmax) {
      xmax = x;
    }
    if (y > ymax) {
      ymax = y;
    }
    if (x < xmin) {
      xmin = x;
    }
    if (y < ymin) {
      ymin = y;
    }
    latlngs.push([lat, lon]);
    xtab.push(x);
    ytab.push(y);

  }
  console.log(xmin);

  for (var j = 0; j < xtab.length; j++) {
    x = xtab[j] - xmin + 10;
    y = ytab[j] - ymin + 10;
    //console.log(x)
    if (j % 4 == 0) {
      points = points + x.toString() + "," + y.toString() + " ";
    }

  }
  //  console.log(points);
  document.getElementById('svg_image').innerHTML = "<polyline points=\"" + points +
    "\"style=\"fill:none;stroke:white;stroke-width:2\" />";
  set_title(name);

}


function set_title(name) {
  document.getElementById('svg_image').innerHTML += "<text x=\"150\" y=\"370\" " +
    "font-family=\" Lato\" text-anchor=\"middle\" " +
    "fill = \"white\"" +
    "  font-size=\"18\">" +
    name +
    "</text>"
}

var scale = 1;

function get_point() {
  var points = document.getElementById('svg_image').innerHTML;
  var str_array = points.split(' points=\"');
  var data = str_array[1].split(' ');
  var point_scale = new String('');
  for (var i = 0; i < data.length - 2; i++) {
    var xy = data[i].split(',');
    var x = parseInt(xy[0]);
    var y = parseInt(xy[1]);
    point_scale = point_scale + x.toString() + "," + y.toString() + " ";
  }
  return point_scale
}

function update_factor(value) {

  var points = document.getElementById('svg_image').innerHTML;
  var str_array = points.split(' points=\"');
  var data = str_array[1].split(' ');
  var point_scale = new String('');
  for (var i = 0; i < data.length - 2; i++) {
    var xy = data[i].split(',');
    var x = parseInt(parseInt(xy[0]) / scale * value);
    var y = parseInt(parseInt(xy[1]) / scale * value);
    point_scale = point_scale + x.toString() + "," + y.toString() + " ";
  }

  scale = value;
  document.getElementById('svg_image').innerHTML = "<polyline points=\"" + point_scale +
    "\"style=\"fill:none;stroke:white;stroke-width:2\" />";
  set_title(name);
}

var x, y = 0;

function move_x(value) {
  x = value;
  var point_scale = get_point();
  document.getElementById('svg_image').innerHTML = "<polyline points=\"" + point_scale +
    "\"style=\"fill:none;stroke:white;stroke-width:2\" transform=\"translate(" + value + "," + y + ")\" />";
  set_title(name);
  //set_borders(0);
}

function move_y(value) {
  y = value;
  var point_scale = get_point();
  document.getElementById('svg_image').innerHTML = "<polyline points=\"" + point_scale +
    "\"style=\"fill:none;stroke:white;stroke-width:2\" transform=\"translate(" + x + "," + value + ")\" />";
  set_title(name);
  //set_borders(0);
}

var toggle = 0;

function set_borders(toogle) {
  toggle = 1 - toggle;
  if (toggle == 1) {
    document.getElementById('svg_image').innerHTML += "<rect x=\"10\" y=\"10\" width=\"280\" height=\"380\" stroke=\"white\" fill=\"blue\"" +
      " fill-opacity=\"0\" stroke-opacity=\"1\"/>";
  }else{
    document.getElementById('svg_image').innerHTML -= "<rect x=\"10\" y=\"10\" width=\"280\" height=\"380\" stroke=\"white\" fill=\"blue\"" +
      " fill-opacity=\"0\" stroke-opacity=\"1\"/>";
  }

}

function save(){
saveSvgAsPng(document.getElementById("svg_image"), "maaxart.png");
}


function calculs() {

  var distance = [];
  var allures = [];
  var time = [];
  var altitude = [];
  var total_distance = 0;
  var denivele = 0;
  var allure;

  for (var i = 1; i < gpx_data.features[0].geometry.coordinates.length; i++) {

    lon1 = gpx_data.features[0].geometry.coordinates[i][0];
    lon2 = gpx_data.features[0].geometry.coordinates[i - 1][0];
    lat1 = gpx_data.features[0].geometry.coordinates[i][1];
    lat2 = gpx_data.features[0].geometry.coordinates[i - 1][1];
    ele1 = gpx_data.features[0].geometry.coordinates[i][2];
    ele2 = gpx_data.features[0].geometry.coordinates[i - 1][2];
    time1 = gpx_data.features[0].properties.coordTimes[i];
    time2 = gpx_data.features[0].properties.coordTimes[i - 1];

    distance.push(calcul_distance(lon1, lat1, lon2, lat2));
    allure = calcul_allure(distance[i - 1], new Date(time1).getTime() - new Date(time2).getTime());
    if (allure > 25) {
      allures.push(25.0);
    } else {
      allures.push(allure);
    }

    time.push(time1);
    altitude.push(ele1);

    total_distance += calcul_distance(lon1, lat1, lon2, lat2);
    if (ele2 - ele1 > 0) {
      denivele += ele2 - ele1
    }

  }
  //graph(allures, parse_time(time), altitude)
  return allures;
}

function calcul_allure(distance, temps) {
  allure = (temps / 60000) / distance;
  allure = parseInt(allure) + ((allure % 1) * 0.6);
  return allure;
}

function parse_time(time) {
  var duree = [];
  var sec;
  var min;
  var hour;
  var date0 = new Date(time[0]).getTime();
  var timestamp;


  for (var i = 0; i < time.length; i++) {
    timestamp = new Date(time[i]).getTime() - date0;
    hour = parseInt(timestamp / 3600000);
    min = parseInt(timestamp / 60000);
    sec = (timestamp % 60000) / 1000;
    if (min < 10) {
      if (sec < 10) {
        duree.push("" + hour + ":0" + min + ":0" + sec);
      } else {
        duree.push("" + hour + ":0" + min + ":" + sec);
      }
    } else if (sec < 10) {
      duree.push("" + hour + ":" + min + ":0" + sec);
    } else {
      duree.push("" + hour + ":" + min + ":" + sec);
    }

  }

  return duree;
}

function lissage_allure(allure) {
  var allures_lisse = [];
  for (var i = 0; i < allure.length - 3; i++) {
    //calcul faux
    allures_lisse.push((allure[i] + allure[i + 1] + allure[i + 2] + allure[i + 3]) / 4);
  }
  return allures_lisse;
}

function calcul_distance(lon1, lat1, lon2, lat2) {

  theta = convertRad(lon1 - lon2);
  distance = Math.sin(convertRad(lat1)) * Math.sin(convertRad(lat2)) + Math.cos(convertRad(lat1)) * Math.cos(convertRad(lat2)) * Math.cos(theta);
  distance = Math.acos(distance) * 180 / Math.PI;
  distance = distance * 60 * 1.1515 * 1.609344;

  return distance;
}

/*function graph(pace, time, denivele) {
  var ctx = document.getElementById("myChart").getContext('2d');
  ctx.canvas.height = 500;
  ctx.canvas.width = $(window).width() * 0.8;

  var pace_max = Math.max.apply(Math, pace);
  var pace_min = Math.min.apply(Math, pace);
  if (pace_max) {

  } else {
    pace_max = 25;
    pace_min = 0;
  }

  var d_max = Math.max.apply(Math, denivele);
  var d_min = Math.min.apply(Math, denivele);

  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: time,
      datasets: [{
          yAxisID: 'A',
          label: "Pace (min/km)",
          borderColor: "#4e6e9d",
          data: pace,
          fill: false,
          radius: 0,
        },
        {
          yAxisID: 'B',
          label: "D+",
          backgroundColor: "#eceaea",
          borderColor: "#b3b3b3",
          data: denivele,
          fill: false,
          fillOpacity: 0.1,
          radius: 1,
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      title: {
        display: true,
        text: 'Pace and grade graph'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Month'
          }
        }],
        yAxes: [{
            id: 'A',
            display: true,
            ticks: {
              min: pace_min - 1,
              max: pace_max + 1,
              stepSize: 1,
              reverse: true,
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          },
          {
            id: 'B',
            display: true,
            ticks: {
              min: d_min - 10,
              max: d_max + 10,
              stepSize: 10,
              reverse: false,
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          }
        ],
        xAxes: [{
          beginAtZero: true,
          stepSize: 50,
        }]
      }
    }
  });

}*/

//Conversion des degrés en radian
function convertRad(input) {
  return (Math.PI * input) / 180;
}
