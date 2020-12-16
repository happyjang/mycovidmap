import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import axios from 'axios'
import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';
import Snippet from 'components/Snippet';
import { useTracker } from 'hooks';
import { commafy, friendlyDate } from 'lib/util';

const LOCATION = {
  // lat: 38.9072,
  // lng: -77.0369,
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;



const IndexPage = () => {
  const { data: countries = [] } = useTracker({
    api: 'countries'
  });

  const { data: stats = {} } = useTracker({
    api: 'all'
  });
  const hasCountries = Array.isArray(countries) && countries.length > 0;

  const dashboardStats = [
    {
      primary: {
        label: 'Total Cases',
        value: stats ? commafy(stats?.cases) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats?.casesPerOneMillion
      }
    },
    {
      primary: {
        label: 'Total Deaths',
        value: stats ? commafy(stats?.deaths) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats?.deathsPerOneMillion
      }
    },
    {
      primary: {
        label: 'Total Tests',
        value: stats ? commafy(stats?.tests) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats?.testsPerOneMillion
      }
    },
    {
      primary: {
        label: 'Active Cases',
        value: stats ? commafy(stats?.active) : '-'
      }
    },
    {
      primary: {
        label: 'Critical Cases',
        value: stats ? commafy(stats?.critical) : '-'
      }
    },
    {
      primary: {
        label: 'Recovered Cases',
        value: stats ? commafy(stats?.recovered) : '-'
      }
    }
  ]

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
  };

  /**
   * MapEffect
   * @description This is an example of creating an effect used to zoom in and set a popup on load
   */
  const MapEffect = () => {
    const map = useMap();

    useEffect(() => {
      const fetchData = async () => {
        if (!hasCountries) return;

        const geoJson = {
          type: 'FeatureCollection',
          features: countries.map((country = {}) => {
            const { countryInfo = {} } = country;
            const { lat, long: lng } = countryInfo;
            return {
              type: 'Feature',
              properties: {
                ...country,
              },
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            }
          })
        }

        const geoJsonLayers = new L.GeoJSON(geoJson, {
          pointToLayer: (feature = {}, latlng) => {
            const { properties = {} } = feature;
            let updatedFormatted;
            let casesString;

            const {
              country,
              updated,
              cases,
              deaths,
              recovered
            } = properties

            casesString = `${cases}`;

            if (cases > 1000) {
              casesString = `${casesString.slice(0, -3)}k+`
            }

            if (updated) {
              updatedFormatted = new Date(updated).toLocaleString();
            }

            const html = `
            <span class="icon-marker">
              <span class="icon-marker-tooltip">
                <h2>${country}</h2>
                <ul>
                  <li><strong>Confirmed:</strong> ${cases}</li>
                  <li><strong>Deaths:</strong> ${deaths}</li>
                  <li><strong>Recovered:</strong> ${recovered}</li>
                  <li><strong>Last Update:</strong> ${updatedFormatted}</li>
                </ul>
              </span>
              ${casesString}
            </span>
          `;

            return L.marker(latlng, {
              icon: L.divIcon({
                className: 'icon',
                html
              }),
              riseOnHover: true
            });
          }
        });
        geoJsonLayers.addTo(map)
      }
      fetchData();
    }, []);

    return null;
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <div className="tracker">
        <Map {...mapSettings}>
          <MapEffect />
        </Map>
        <div className="tracker-stats">
          <ul>
            {dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
              return (
                <li key={`Stat-${i}`} className="tracker-stat">
                  { primary.value && (
                    <p className="tracker-stat-primary">
                      { primary.value}
                      <strong>{primary.label}</strong>
                    </p>
                  )}
                  { secondary.value && (
                    <p className="tracker-stat-secondary">
                      { secondary.value}
                      <strong>{secondary.label}</strong>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="tracker-last-updated">
  <p>
    Last Updated: { stats?.updated }
  </p>
</div>
      </div>

    </Layout>
  );
};

export default IndexPage;
