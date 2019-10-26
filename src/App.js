import React from "react";
import "./App.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiData: null
    };

    this.generateApiExplorer = this.generateApiExplorer.bind(this);
  }

  generateApiExplorer(newApiData) {
    console.log("did the thing");
    this.setState({
      apiData: newApiData
    });
  }

  render() {
    return (
      <div className="app">
        <h1 className="title"> Open API Explorer </h1>
        <h2 className="title"> Enter an Open API JSON specification into the text box to get started </h2>
        <SpecInput generateApiExplorer={this.generateApiExplorer} />
        <Explorer apiData={this.state.apiData} />
      </div>
    );
  }
}

class SpecInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            generateApiExplorer: props.generateApiExplorer,
            apiData: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(event) {
        this.setState({
            apiData: event.target.value
        });
    }

    handleClick(event) {
        this.state.generateApiExplorer(this.state.apiData);
    }

    render() {
        return (
            <div className="wrapper">
                <textarea className="spec-input" onChange={this.handleChange} />
                <input className="spec-submit" type="button" value="Create API Client!" onClick={this.handleClick} />
            </div>
        );
    }
}

class Explorer extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <h1>{this.props.apiData}</h1>
      </div>
    );
  }
}
