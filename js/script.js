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

function load_gpx(contents) {
  //console.log(contents);
  gpx_data = toGeoJSON.gpx(jQuery.parseXML(contents));
  console.log(gpx_data);
  var latlngs = [];

  for (var i = 0; i < gpx_data.features[0].geometry.coordinates.length; i++) {
    lon = gpx_data.features[0].geometry.coordinates[i][0];
    lat = gpx_data.features[0].geometry.coordinates[i][1];
    latlngs.push([lat, lon]);

  }

  //console.log(latlngs);
  var polyline = L.polyline(latlngs, {
    color: 'green'
  }).addTo(map);
  // zoom the map to the polyline
  polyline.dragging.enable();

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
  graph(allures, parse_time(time), altitude)
  //console.log(allures);
  //console.log(denivele);
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

function graph(pace, time, denivele) {
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

}

//Conversion des degrés en radian
function convertRad(input) {
  return (Math.PI * input) / 180;
}
//////////FIN GPX////////////////////////

////IMAGE//////////////////////
var overlay; //image overlay
function readImage(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  if (file.name.substring(file.name.lastIndexOf('.')) != ".jpg" &&
    file.name.substring(file.name.lastIndexOf('.')) != ".png" &&
    file.name.substring(file.name.lastIndexOf('.')) != ".JPG" &&
    file.name.substring(file.name.lastIndexOf('.')) != ".PNG") {
    //Alerte sur le format du fichier
    alert('Choisir un fichier jpg ou png');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    //console.log(file.name);

    var i = 0;
    var point1, point2, point3;
    var marker1, marker2, marker3;
    var poly1;
    var pg;

    map.on('click', function(e) {
      if (i < 3) {
        switch (i) {
          case 0:
            marker1 = new L.marker(e.latlng, {
              draggable: true
            }).addTo(map);
            point1 = e.latlng;
            //console.log(point1);
            //console.log(L.latLng(49.083536, -1.607909))
            break;
          case 1:
            marker2 = new L.marker(e.latlng, {
              draggable: true
            }).addTo(map);
            point2 = e.latlng;
            break;
          case 2:
            marker3 = new L.marker(e.latlng, {
              draggable: true
            }).addTo(map);
            point3 = e.latlng;
            console.log(point1);
            poly1 = [point1, point2, point3];
            pg = new L.Polygon([poly1], {
              draggable: true,
              opacity: 0,
              fillOpacity: 0
            }).addTo(map);
            display_image();
            break;
          default:
            alert("erreur");
        }
        i++;
      } else {
        //alert('3 markers');
      }
    });

    // var point1 = L.latLng(49.083536, -1.607909)

    function display_image() {
      var bounds = new L.LatLngBounds(point1, point2).extend(point3);
      map.fitBounds(bounds);
      //console.log(file);
      //console.log(contents);

      overlay = L.imageOverlay.rotated(contents, point1, point2, point3, {
        opacity: 0.4,
        interactive: true
      });

      //ajout boutons opacité sur la carte
      // start with an array of easy buttons
      var buttons = [L.easyButton('<span class="opacity">25%</span>', function() {
          setOverlayOpacity(0.25)
        }),
        L.easyButton('<span class="opacity">50%</span>', function() {
          setOverlayOpacity(0.5)
        }),
        L.easyButton('<span class="opacity">75%</span>', function() {
          setOverlayOpacity(0.75)
        }),
        L.easyButton('<span class="opacity">100%</span>', function() {
          setOverlayOpacity(1)
        })
      ];

      // build a toolbar with them
      L.easyBar(buttons).addTo(map);

      marker1.on('drag dragend', repositionImage);
      marker2.on('drag dragend', repositionImage);
      marker3.on('drag dragend', repositionImage);

      var switch_marker = 1;
      map.addLayer(overlay);
      overlay.on('dblclick', function(e) {
        console.log('Double click on image.');
        //cache les markers
        if (switch_marker == 0) {

          marker1 = L.marker(point1, {
            draggable: true
          }).addTo(map);
          marker2 = L.marker(point2, {
            draggable: true
          }).addTo(map);
          marker3 = L.marker(point3, {
            draggable: true
          }).addTo(map);
          marker1.on('drag dragend', repositionImage);
          marker2.on('drag dragend', repositionImage);
          marker3.on('drag dragend', repositionImage);
          switch_marker = 1
        } else {
          map.removeLayer(marker1);
          map.removeLayer(marker2);
          map.removeLayer(marker3);
          switch_marker = 0;
        }

        //e.stop();
      });
      pg.on('drag dragend', function(e) {
        var geopg = pg.toGeoJSON();
        console.log(geopg);
        switch_marker = 1;
        map.removeLayer(marker1);
        map.removeLayer(marker2);
        map.removeLayer(marker3);
        var bound1 = yx(geopg.geometry.coordinates[0][0]);
        var bound2 = yx(geopg.geometry.coordinates[0][1]);
        var bound3 = yx(geopg.geometry.coordinates[0][2]);
        marker1 = L.marker(bound1, {
          draggable: true
        }).addTo(map);
        marker2 = L.marker(bound2, {
          draggable: true
        }).addTo(map);
        marker3 = L.marker(bound3, {
          draggable: true
        }).addTo(map);
        console.log(bound1);
        marker1.on('drag dragend', repositionImage);
        marker2.on('drag dragend', repositionImage);
        marker3.on('drag dragend', repositionImage);
        overlay.reposition(bound1, bound2, bound3);
        //  overlay.setBounds();
      });
      overlay.on('click', function(e) {
        console.log('Click on image.');
        var img_bounds = overlay.getBounds();
        console.log(img_bounds);
      });


    }

    function repositionImage() {
      point1 = marker1.getLatLng();
      point2 = marker2.getLatLng();
      point3 = marker3.getLatLng();
      poly1 = [point1, point2, point3];
      pg.setLatLngs(poly1);
      overlay.reposition(marker1.getLatLng(), marker2.getLatLng(), marker3.getLatLng());
    };

  };
  reader.readAsDataURL(file);
}

function setOverlayOpacity(opacity) {
  overlay.setOpacity(opacity);
}

function yx(tab) {
  var yx = [2];
  yx[0] = tab[1];
  yx[1] = tab[0];

  return yx
}
/*function readImageandTransform(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    if (file.name.substring(file.name.lastIndexOf('.')) != ".jpg" &&
        file.name.substring(file.name.lastIndexOf('.')) != ".png" &&
        file.name.substring(file.name.lastIndexOf('.')) != ".JPG" &&
        file.name.substring(file.name.lastIndexOf('.')) != ".PNG") {
        //Alerte sur le format du fichier
        alert('Choisir un fichier jpg ou png');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        //console.log(file.name);

        var i = 0;
        var point1, point2, point3, point4;
        var marker1, marker2, marker3, marker4;
        var poly1;
        var pg;

        map.on('click', function(e) {
            if (i < 4) {
                switch (i) {
                    case 0:
                        marker1 = new L.marker(e.latlng, {
                            draggable: true
                        }).addTo(map);
                        point1 = e.latlng;
                        //console.log(point1);
                        //console.log(L.latLng(49.083536, -1.607909))
                        break;
                    case 1:
                        marker2 = new L.marker(e.latlng, {
                            draggable: true
                        }).addTo(map);
                        point2 = e.latlng;
                        break;
                  case 2:
                            marker3 = new L.marker(e.latlng, {
                                draggable: true
                            }).addTo(map);
                            point3 = e.latlng;
                            break;
                    case 3:
                        marker4 = new L.marker(e.latlng, {
                            draggable: true
                        }).addTo(map);
                        point4 = e.latlng;
                        display_image();
                        break;
                    default:
                        alert("erreur");
                }
                i++;
            } else {
                //alert('3 markers');
            }
        });

        // var point1 = L.latLng(49.083536, -1.607909)

        function display_image() {
            var bounds = new L.LatLngBounds(point1, point2).extend(point3);
            map.fitBounds(bounds);
            console.log(file);
            console.log(contents);
            // create an image
    img = new L.DistortableImageOverlay(
      contents, {
        corners: [
          point1,
          point2,
          point3,
          point4
        ]
      }
    ).addTo(map);

    L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing);



          /*  overlay = L.imageOverlay.rotated(contents, point1, point2, point3, {
                opacity: 0.4,
                interactive: true
            });

            marker1.on('drag dragend', repositionImage);
            marker2.on('drag dragend', repositionImage);
            marker3.on('drag dragend', repositionImage);

            var switch_marker = 1;
            map.addLayer(overlay);
            overlay.on('dblclick', function(e) {
                console.log('Double click on image.');
                //cache les markers
                if (switch_marker == 0) {

                    marker1 = L.marker(point1, {
                        draggable: true
                    }).addTo(map);
                    marker2 = L.marker(point2, {
                        draggable: true
                    }).addTo(map);
                    marker3 = L.marker(point3, {
                        draggable: true
                    }).addTo(map);
                    marker1.on('drag dragend', repositionImage);
                    marker2.on('drag dragend', repositionImage);
                    marker3.on('drag dragend', repositionImage);
                    switch_marker = 1
                } else {
                    map.removeLayer(marker1);
                    map.removeLayer(marker2);
                    map.removeLayer(marker3);
                    switch_marker = 0;
                }

                //e.stop();
            });
            overlay.on('click', function(e) {
                console.log('Click on image.');
            });*/
/*    }


        function repositionImage() {
            point1 = marker1.getLatLng();
            point2 = marker2.getLatLng();
            point3 = marker3.getLatLng();
            overlay.reposition(marker1.getLatLng(), marker2.getLatLng(), marker3.getLatLng());
        };

    };
    reader.readAsDataURL(file);


}*/
