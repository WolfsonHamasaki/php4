/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {NavigationControl} from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import ControlPanel from './control-panel.js';

import {json as d3Json} from 'd3-request';
import {queue as d3Queue} from 'd3-queue';

// Set your mapbox token here
const MAPBOX_TOKEN = 'pk.eyJ1Ijoid29sZnNvbmhhbWFzYWtpIiwiYSI6ImNrZ3JzZG1kZjA0djYyc3BwZ3JsNnBuN2EifQ.GzfIxzIsR8M0YulC3auRWg';
const MAPBOX_STYLE = 'mapbox://styles/moffsatoshi/cja2521al0g2u2rlrneq7uar7';


class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      layers: {
        scatter: {data: null, visible: true},
        arc: {data: null, visible: true},
        grid: {data: null, visible: true}
        // line: {data: null, visible: true}
      },
      years: ['2015', '2020', '2025', '2030', '2039', '2050'],
      scenarios: ['001', '002', '003', '004', '005', '006', '007'],
      types: ['Act', 'Cap'],
      currentYear: '2015',
      currentScenario: '001',
      currentType: 'Act',
      displayType: 'Act',
    };
    this._onHover = this._onHover.bind(this);

    d3Json('./data/grid.json', (error, response) => {
      const {layers} = this.state;
      layers.grid.data = (!error) ? response : null;
      this.setState({layers: layers});
    });

    this.load();
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onVisibleChange(visibles) {
    Object.entries(visibles).map(([name, visible]) => {
      this.state.layers[name].visible = visible;
    });
    this.setState(this.state);
  }
  _onChangeSelectValue(e) {
    this.setState({selectValue: e.target.value});
  }

  _onHover(info) {
    const hoverInfo = info.object ? info : null;
    if (hoverInfo !== this.state.hoverInfo) {
      this.setState({hoverInfo});
    }
  }

  load() {
    const {layers, displayType, currentYear, currentScenario, currentType} = this.state;

    layers.arc.data = null;
    layers.scatter.data = null;
    // layers.line.data = null;

    const currentPattern = `${currentYear}_${currentScenario}_${currentType}`;

    d3Queue()
      .defer(d3Json, `./data/arc_${currentPattern}.json`)
      .defer(d3Json, `./data/scatter_${currentPattern}.json`)
      // .defer(requestJson, `./data/line_${currentPattern}.json`)
      .await((error, arcData, scatterData/*, lineData*/) => {
        if (error) return;
        layers.arc.data = arcData;
        layers.scatter.data = scatterData;
        // layers.line.data = lineData;
        this.setState({layers: layers, displayType: currentType.toLowerCase()});
      });
  }

  render() {
    const {viewport, layers, years, scenarios, types, currentYear, currentScenario, currentType, displayType, hoverInfo} = this.state;

    return (
      <MapGL
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        mapStyle={MAPBOX_STYLE} mapboxApiAccessToken={MAPBOX_TOKEN}>
        <div className="nav">
          <NavigationControl onViewportChange={this._onViewportChange.bind(this)} />
        </div>
        <div className="control-panel-wrap">
          <div className="control-panel">
            <section className="pattern-section">
              <div className="pattern-title">Scenario</div>
              {scenarios.map(value => {
                return <div className="pattern-select" key={value}>
                  <label><input type="radio" name="scenario" value={value} checked={currentScenario===value} onChange={e => this.setState({currentScenario: e.target.value})}/>{value}</label>
                </div>
              })}
            </section>
            <section className="pattern-section">
              <div className="pattern-title">Period</div>
              {years.map(value => {
                return <div className="pattern-select" key={value}>
                  <label><input type="radio" name="year" value={value} checked={currentYear===value} onChange={e => this.setState({currentYear: e.target.value})}/>{value}</label>
                </div>
              })}
            </section>
            <section className="pattern-section">
              <div className="pattern-title">Act / Cap</div>
              {types.map(value => {
                return <div className="pattern-select" key={value}>
                  <label><input type="radio" name="type" value={value} checked={currentType===value} onChange={e => this.setState({currentType: e.target.value})}/>{value}</label>
                </div>
              })}
            </section>
            <div className="update">
              <button onClick={e => this.load()}>Update</button>
            </div>
          </div>
          <ControlPanel layers={layers} onChange={this._onVisibleChange.bind(this)} />
        </div>
        <DeckGLOverlay viewport={viewport} layers={layers} type={displayType} onHover={this._onHover} />

        {hoverInfo &&
          <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}} >
            Scatter: { hoverInfo.object.value.toFixed(2) }
          </div>
        }
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
