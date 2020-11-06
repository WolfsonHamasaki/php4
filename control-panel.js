import React, {PureComponent} from 'react';


export default class StyleControls extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      visible: {
        arc: props.layers.arc.visible,
        scatter: props.layers.scatter.visible,
        grid: props.layers.grid.visible
        // line: props.layers.line.visible
      }
    };
  }

  componentDidMount() {
    this.props.onChange(this.state.visible);
  }

  _onVisibilityChange(name, event) {
    const visible = {...this.state.visible, [name]: event.target.checked};
    this.setState({visible});
    this.props.onChange(visible);
  }

  render() {
    const {visible} = this.state;
    return (
      <div className="control-panel is-layers">
        <div className="pattern-title">Layers</div>
        {
          Object.entries(visible).map(([name, value]) => {
            return <div key={name} className="pattern-select layer">
              <label>
                <input type="checkbox" checked={visible[name]} onChange={this._onVisibilityChange.bind(this, name)} />
                {name}
              </label>
            </div>
          })
        }
      </div>
    );
  }
}
