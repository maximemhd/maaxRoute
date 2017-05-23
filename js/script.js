function trace_gpx(){
  var gpx_data;
  $.ajax('pyramide.gpx').done(function(xml) {
    gpx_data = toGeoJSON.gpx(xml);
    console.log(gpx_data);

    var latlngs = [];

    for (var i=0; i<gpx_data.features[0].geometry.coordinates.length;i++){
      lon = gpx_data.features[0].geometry.coordinates[i][0];
      lat = gpx_data.features[0].geometry.coordinates[i][1];
      latlngs.push([lat, lon]);

    }
console.log(latlngs);
var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
// zoom the map to the polyline
polyline.dragging.enable();
polyline.enableEdit();


map.fitBounds(polyline.getBounds());

    //var myLayer = L.geoJSON(gpx_data.features,{onEachFeature: onEachFeature}).addTo(map);
    //myLayer.addData(gpx_data, {draggable: true});
    //myLayer.dragging.enable();
    //map.fitBounds(myLayer.target.getBounds());
  });
}


function trace_gpx_image(){
  var gpx_data;
  L.easyButton('fa-globe', function(btn, map){
window.open("file:///" );
  }).addTo(map);

  $.ajax('CO_MD_Le_Senequet.gpx').done(function(xml) {
    gpx_data = toGeoJSON.gpx(xml);
    console.log(gpx_data);

    var latlngs = [];

    for (var i=0; i<gpx_data.features[0].geometry.coordinates.length;i++){
      lon = gpx_data.features[0].geometry.coordinates[i][0];
      lat = gpx_data.features[0].geometry.coordinates[i][1];
      latlngs.push([lat, lon]);
    }


console.log(latlngs);
var polyline = L.polyline(latlngs, {color: 'green'}).addTo(map);
// zoom the map to the polyline
polyline.dragging.enable();


  });

}

function load_gpx(contents){
  var gpx_data;
//console.log(contents);
    gpx_data = toGeoJSON.gpx(jQuery.parseXML(contents));
    console.log(gpx_data);

    var latlngs = [];

    for (var i=0; i<gpx_data.features[0].geometry.coordinates.length;i++){
      lon = gpx_data.features[0].geometry.coordinates[i][0];
      lat = gpx_data.features[0].geometry.coordinates[i][1];
      latlngs.push([lat, lon]);
    }


console.log(latlngs);
var polyline = L.polyline(latlngs, {color: 'green'}).addTo(map);
// zoom the map to the polyline
polyline.dragging.enable();

}

function readGPXFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
console.log(typeof(contents));
load_gpx(contents);
    //displayContents(contents);
  };
reader.readAsText(file);


}

function readImage(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
//console.log(file.name);
var point1 = L.latLng( 49.083536, -1.607909),
		    point2 = L.latLng(49.083536, -1.604648),
		    point3 = L.latLng(49.08719, -1.604583);

		var marker1 = L.marker(point1, {draggable: true} ).addTo(map),
		    marker2 = L.marker(point2, {draggable: true} ).addTo(map),
		    marker3 = L.marker(point3, {draggable: true} ).addTo(map);


		var	bounds = new L.LatLngBounds(point1, point2).extend(point3);
		map.fitBounds(bounds);
		var overlay = L.imageOverlay.rotated(file.name, point1, point2, point3, {
			opacity: 0.4,
			interactive: true
		});



		marker1.on('drag dragend', repositionImage);
		marker2.on('drag dragend', repositionImage);
		marker3.on('drag dragend', repositionImage);


		map.addLayer(overlay);
		overlay.on('dblclick',function (e) {
			console.log('Double click on image.');
			e.stop();
		});
		overlay.on('click',function (e) {
			console.log('Click on image.');
		});

  };
reader.readAsDataURL(file);


}

function setOverlayOpacity(opacity) {
  overlay.setOpacity(opacity);
}


function repositionImage() {
  overlay.reposition(marker1.getLatLng(), marker2.getLatLng(), marker3.getLatLng());
};

function trbl(top,right,bottom,left) {
  return [[bottom,left],[top,right]];;
}
