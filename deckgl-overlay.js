import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL, {ArcLayer, /*LineLayer,*/ ScatterplotLayer, GridLayer} from 'deck.gl';

const COLORS = {
  arc: {
    act: {
      source: [0, 255, 192,0],
      target: [0, 255, 192,255]
    },
    cap: {
        source: [120, 255, 73,0],
      target: [120, 255, 73,255]
    }
  },
  scatter: {
    act: [0, 232, 229 ,180],
    cap: [185, 232, 44 ,180]
  },
  grid: {
    act: [
      [84, 80, 255],
      [112, 74, 255],
      [143, 68, 255],
      [176, 52, 255],
      [215, 34, 254],
      [255, 49, 190],
    ],
    cap: [
      [84, 80, 255],
      [112, 74, 255],
      [143, 68, 255],
      [176, 52, 255],
      [215, 34, 254],
      [255, 49, 190],
    ]
  }
};
const LIGHT_SETTINGS = {
  lightsPosition: [-70, 20.5, 5000, -52.8, 10.5, 8000],
  ambientRatio: 0.32,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      longitude: 136.6850,
      latitude: 37.0,
      zoom: 6,
      maxZoom: 15,
      pitch: 60,
      bearing: 30
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      layers: props.layers,
      type: props.type
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.layers !== this.props.layers) {
      this.setState({layers: nextProps.layers});
    }
    if (nextProps.type !== this.props.type) {
      this.setState({type: nextProps.type});
    }
  }

  _initialize(gl) {
    setParameters(gl, {
      depthTest: true,
      depthFunc: gl.LEQUAL
    });
  }

  render() {
    const {viewport} = this.props;
    const {arc, /*line,*/ scatter, grid} = this.state.layers;
    const {type} = this.state;
    if (!arc.data || /*!line.data  ||*/ !scatter.data  || !grid.data ) return null;

    const layers = [
      new ArcLayer({
        id: 'arc',
        data: arc.data,
        visible: arc.visible,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => COLORS.arc[type].source,
        getTargetColor: d => COLORS.arc[type].target,
        strokeWidth: 8
      }),
      new ScatterplotLayer({
        id: 'scatter',
        data: scatter.data,
        visible: scatter.visible,
        //getPosition: d => d.source,
        getRadius: d => d.value,
        getColor: d => COLORS.scatter[type],
        radiusScale: 10000,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      }),
      new GridLayer({
        id: 'grid',
        data: grid.data,
        visible: grid.visible,
        extruded: true,
        elevationScale: 80,
        elevationDomain: [0, 10],
        cellSize: 10000,
        coverage:0.5,
        lightSettings: LIGHT_SETTINGS,
        colorRange: COLORS.grid[type],
      })
      /*
       new LineLayer({
       id: 'line',
       data: line.data,
       visible: line.visible,
       getSourcePosition: d => d.source,
       getTargetPosition: d => d.target,
       getColor: d => [0, 255, 0],
       strokeWidth: 5
       }),
       */
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
