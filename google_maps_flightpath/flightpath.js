var Flightpath = {
  init: function () {
    if (GBrowserIsCompatible()) {
      Flightpath.map = new GMap2(document.getElementById("map_canvas"));
      Flightpath.map.setCenter(new GLatLng(51.380299,-2.703238), 14);
      Flightpath.map.setMapType(G_SATELLITE_MAP);
      
      Flightpath.map.setUIToDefault();
      Flightpath.map.disableDoubleClickZoom();
      
      GEvent.addListener(Flightpath.map, "click", Flightpath.addWaypoint);
    }
  },
  
  addWaypoint: function (overlay, ll) {
    var lat = ll.lat();
    var lng = ll.lng();
    
    var new_wps = [];
    var old_wps = Flightpath.waypoints;
    
    for (var i in old_wps) {
      new_wps.push(old_wps[i]);
    }
    
    if (new_wps.length >= 3) {
      new_wps.pop();
    }
    
    new_wps.push(new GLatLng(lat, lng));
    
    // Only add the start position on to the end of the flight path if
    if (new_wps.length >= 3) {
      new_wps.push(old_wps[0]);
    }
    
    Flightpath.waypoints = new_wps;
    
    Flightpath.addFlightpath();
  },
  
  removeFlightpath: function () {
    if (Flightpath.overlay) {
      Flightpath.map.removeOverlay(Flightpath.overlay);
      Flightpath.overlay = null;
    }
  },
  
  addFlightpath: function () {
    Flightpath.removeFlightpath();
    Flightpath.overlay = new GPolyline(Flightpath.waypoints, "#0000ff", 10);
    Flightpath.map.addOverlay(Flightpath.overlay);
    // @TODO remove
    Flightpath.outputWaypointTable();
  },
  
  clearWaypoints: function () {
    Flightpath.waypoints = [];
    Flightpath.removeFlightpath();
  },
  
  calculateDistance: function (first, second) {
      function d2r (d) {
        return (d * Math.PI) / 189;
      }
      
      var R = 6371; // km
      var dLat = d2r(second.lat()-first.lat());
      var dLon = d2r(second.lng()-first.lng()); 
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(d2r(first.lat())) * Math.cos(d2r(second.lat())) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      
      return d;
  },
  
  calculateTotalDistance: function () {
    var total_distance = 0;
    if (Flightpath.waypoints && Flightpath.waypoints.length > 1) {
      
      for (var i = 1; i < Flightpath.waypoints.length; i++) {
        //console.log("Work out from", i-1, "to", i);
        var pos1 = Flightpath.waypoints[i-1];
        var pos2 = Flightpath.waypoints[i];
        
        total_distance += Flightpath.calculateDistance(pos1, pos2);
      }
    }
    
    return total_distance;
  },
  
  outputWaypointTable: function () {
    var el = document.getElementById("waypoint_table");
    var output = "";
    
    el.innerHTML = "";
    output += "<table>";
      output += "<tr><th>Number</th><th>Lat</th><th>Long</th></tr>";
      for (var i in Flightpath.waypoints) {
        var wp = Flightpath.waypoints[i];
        var num = parseInt(i)+1;
        output += sprintf("<tr><td>%d</td><td>%.4f</td><td>%.4f</td></tr>", num, wp.lat(), wp.lng());
      }
    output += sprintf("<tr><td colspan='3'>Total distance travelled: %.2f km (%.2f miles)</td></tr>", Flightpath.calculateTotalDistance(), (Flightpath.calculateTotalDistance()*8)/5);
    output += "</table>";
    
    el.innerHTML = output;
  }
};
