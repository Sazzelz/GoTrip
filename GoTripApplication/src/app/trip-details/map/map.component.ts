import { Component, OnInit, OnDestroy } from '@angular/core';
import { getTripDetails } from '../../services/getTripDetails.service';
import { env } from 'src/app/env';

import { GetAddedSightService } from '../../services/get-added-sight.service';
import { AddSightService } from '../../services/add-sight.service';

declare var L: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit, OnDestroy {
  public map: any;
  isTheOwner: boolean = false;
  geoLocation: any; // Geolocation of the selected city
  allSights: any; // array with a list of all sights added to the trip

  public constructor(private getTripDetails: getTripDetails, private getAddedSightService: GetAddedSightService, private AddSightService: AddSightService, private env: env) {
    this.geoLocation = this.getTripDetails.currentTrip.geoLocation; // Save current city geolocation
  }

  async ngOnInit() {
    this.isTheOwner = this.getTripDetails.currentTrip.status.isTheOwner; // Search if the user is the owner. If yes he can remove the sights

    //Get all added sights
    await this.getAddedSightService.getSights()
    this.allSights = this.getAddedSightService.addedSights;

    //Start the map
    this.map = L.map('map', {
      scrollWheelZoom: true,
      drawControl: false,
    }).setView([this.geoLocation.lat, this.geoLocation.lon], 15);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: this.env.MAPBOX_API,
    }).addTo(this.map);

    // Initialise the FeatureGroup to store editable layers
    var editableLayers = new L.FeatureGroup();
    this.map.addLayer(editableLayers);

    var drawPluginOptions = {
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: true, // Restricts shapes to simple polygons
          message: 'Click on the <strong>Finish</strong> button to close the chosen perimeter',
          drawError: {
            color: '#e1e100', // Color the shape will turn when intersects
            message: '<strong>Oh snap!</strong> you can\'t draw that!' // Message that will show when intersect
          },
          shapeOptions: {
            color: '#97009c'
          }
        },
        // disable toolbar item by setting it to false
        polyline: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: false,
        },
      edit: {
        featureGroup: editableLayers, //REQUIRED!!
        remove: true
      }
    };

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw(drawPluginOptions);
    this.map.addControl(drawControl);

    var editableLayers = new L.FeatureGroup();
    this.map.addLayer(editableLayers);

    this.map.on('draw:created', function(e:any) {
      var type = e.layerType,
        layer = e.layer;

   if (type === 'marker') {
        layer.bindPopup('A popup!');
      }

      editableLayers.addLayer(layer);
    });


    for (let i = 0; i < this.allSights.length; i++) {
      console.log('working')
      let lat = this.allSights[i].lat;
      let lon = this.allSights[i].lon;
      let title = this.allSights[i].title;

      L.marker([lat, lon]).addTo(this.map).bindPopup(title)
        .openPopup();
    }



  }

  async removeSight(xid: any) {
    //remove the selected sight
    console.log(xid)
    await this.AddSightService.removeSight({ sightServerId: xid })

    //clean list
    this.getAddedSightService.cleanSightList()

    //get all sights added
    this.getAddedSightService.getSights()
    this.allSights = this.getAddedSightService.addedSights;

  }

  ngOnDestroy() {
    this.getAddedSightService.cleanSightList()
  }

}
