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


function trbl(top,right,bottom,left) {
  return [[bottom,left],[top,right]];;
}
