import {Component, OnInit} from '@angular/core';

import * as mapboxgl from 'mapbox-gl';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

    map: mapboxgl.Map;
    hardwareRendering = mapboxgl.supported({ failIfMajorPerformanceCaveat: true });

    private apiBaseUrl: string = 'http://127.0.01:6161';

    ngOnInit() {
        const mapboxOptions: mapboxgl.MapboxOptions = {
            container: 'map',
            style: {
                version: 8,
                sources: {
                    'osm-source': { type: 'raster', tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 }
                },
                layers: [
                    {
                        id: 'osm-layer',
                        type: 'raster',
                        source: 'osm-source',
                        minzoom: 0,
                        maxzoom: 22
                    }
                ],
            },

            attributionControl: false,
            antialias: this.hardwareRendering
        };

        mapboxOptions.center = [ 0, 30 ];
        mapboxOptions.zoom = 2;

        // *******************************************************************
        // Mapbox GL initialization
        // *******************************************************************

        this.map = new mapboxgl.Map(mapboxOptions);
        this.map.addControl(new mapboxgl.NavigationControl());

        this.map.on('mousemove', (e: mapboxgl.MapMouseEvent) => {
            const level = Math.floor(e.target.getZoom());
            const divider = Math.pow(2, level);

            const resultX = (e.lngLat.lng + 180) / (360 / divider);
            const resultY = (1 - Math.log(Math.tan(e.lngLat.lat * Math.PI / 180) + 1 /
				Math.cos(e.lngLat.lat * Math.PI / 180)) / Math.PI) / 2 * divider;
            const resultScale = 500000000 / Math.pow(2, level + 1);

            document.getElementById('info').innerHTML =
                JSON.stringify({ lat: Math.round(e.lngLat.lat * 10000) / 10000, lon: Math.round(e.lngLat.lng * 10000) / 10000 }) + '\n' +
                JSON.stringify({ z: level, x: Math.floor(resultX), y: Math.floor(resultY), scale: Math.floor(resultScale) });
        });

        // *******************************************************************
        // WebGL support
        // *******************************************************************

        const banner = document.getElementsByClassName('banner-webgl')[0];

        if (mapboxgl.supported({ failIfMajorPerformanceCaveat: true })) {
            banner.getElementsByClassName('status')[0].innerHTML = 'WebGL GPU';
            banner.className = 'banner-webgl valid';
        } else if (mapboxgl.supported({ failIfMajorPerformanceCaveat: false })) {
            banner.getElementsByClassName('status')[0].innerHTML = 'WebGL CPU';
            banner.className = 'banner-webgl warning';
        } else {
            banner.getElementsByClassName('status')[0].innerHTML = 'WebGL not supported';
            banner.className = 'banner-webgl danger';
        }

        // *******************************************************************
        // NavWarnings source
        // *******************************************************************

		let self = this;

        this.map.on('load', function() {

            this.addSource('navwarnings-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            this.addLayer({
                id: 'navwanings-layer',
                type: 'circle',
                source: 'navwarnings-source',
                paint: {
                    'circle-radius': 4,
                    'circle-color': '#007cbf',
                    'circle-stroke-color': "#ffffff",
                    'circle-stroke-width': 1,
                    'circle-stroke-opacity': 0.5
                }
            });

            fetch(`${self.apiBaseUrl}/api/navwarnings`)
                .then(response => response.json())
                .then(data => {
                    data = data.map(d => d.data);

                    const geoJson = {
                        type: 'FeatureCollection',
                        features: data
                    };

                    this.getSource('navwarnings-source').setData(geoJson);
                });
        });

        // *******************************************************************
        // Tracking source
        // *******************************************************************

        this.map.on('load', function() {

            this.addSource('tracking-source', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            this.addLayer({
                id: 'tracking-layer',
                type: 'line',
                source: 'tracking-source',
                paint: {
                    'line-width': 2,
                    'line-color': [ 'get', 'color' ]
                }
            });

            this.addLayer({
                id: 'tracking-points-layer',
                type: 'circle',
                source: 'tracking-source',
                paint: {
                    'circle-radius': 3.5,
                    'circle-color': [ 'get', 'color' ],
                    'circle-stroke-color': "#000000",
                    'circle-stroke-width': 1,
                    'circle-stroke-opacity': 0.5
                }
            });

            var groupBy = function(xs, key) {
                return xs.reduce(function(rv, x) {
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            };

            fetch(`${self.apiBaseUrl}/api/tracking?from=2018-04-23&to=2018-04-24`)
                .then(response => response.json())
                .then(data => {
                    data = groupBy(data, 'vessel');

                    let lines = []

                    for (const [vessel, points] of Object.entries(data)) {
                        lines.push({
                            "type" : "Feature",
                            "properties": {
                                "color": "hsl(" + (((vessel as any) * 1) % 255) + ", 50%, 50%)",
                                "description": "Vessel " + vessel
                            },
                            "geometry" : {
                                "type" : "LineString",
                                "coordinates" : (points as any).map(p => [ p.longitude, p.latitude ])
                            }
                        });
                    }

                    var geoJson = {
                        'type': 'FeatureCollection',
                        'features': lines
                    };

                    this.getSource('tracking-source').setData(geoJson);
                });

            var popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            this.on('mouseenter', 'tracking-points-layer', function (e) {
                // Change the cursor style as a UI indicator.
                this.getCanvas().style.cursor = 'pointer';

                var description = e.features[0].properties.description;

                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat(e.lngLat).setHTML(description).addTo(this);
            });

            this.on('mouseleave', 'tracking-points-layer', function () {
                this.getCanvas().style.cursor = '';
                popup.remove();
            });
        });
    }
}
