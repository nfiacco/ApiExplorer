import React from "react";
import Markdown from 'react-markdown'
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
    this.setState({
      apiData: newApiData
    });
  }

  render() {
    return (
      <div className="app">
        <h1 className="title"> Open API Explorer </h1>
        <h2 className="subtitle"> Enter an Open API JSON specification into the text box to get started </h2>
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
                <button className="spec-submit" type="button" onClick={this.handleClick}>Create API Explorer!</button>
            </div>
        );
    }
}

class Explorer extends React.Component {
  render() {
    let content;
    if (!this.props.apiData) {
      content = <h2 className="subtitle"> Your API operations will appear here. </h2>;
    } else {
      try {
        let apiData = JSON.parse(this.props.apiData);
        content = (
          <div className="wrapper">
            <ApiInfo info={apiData.info}/>
            <Operations paths={apiData.paths}/>
          </div>
        );
      } catch(e) {  
        content = <h2 className="subtitle"> Invalid API specification! </h2>;
      }
    }
    return (
      <div className="wrapper">
        {content}
      </div>
    )
  }
}

class ApiInfo extends React.Component {
  render() {
    let title = this.props.info.title || "No Title";
    let description = this.props.info.description || "No description for API.";
    return (
      <div className="info">
        <h1>{title}</h1>
        <Markdown>{description}</Markdown>
      </div>
    );
  }
}

class Operations extends React.Component {
  render() {
    let paths = this.props.paths;
    let operations = [];
    for (let path in paths) {
      for (let method in paths[path]) {
        let info = paths[path][method];
        operations.push(<Operation key={path+method} path={path} method={method} info={info}/>);
      }
    }
    return operations;
  }
}

class Operation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    let current = this.state.showDetails;
    this.setState({showDetails: !current});
  }

  render() {
    let path = this.props.path;
    let method = this.props.method;
    let info = this.props.info;
    return (
      <div className={"opblock opblock-" + method}>
        <div className={this.state.showDetails ? "opblock-summary is-open" : "opblock-summary"} onClick={this.onClick}>
          <div className={"method method-" + method}>
            {method}
          </div>
          <div className="path">
            {path}
          </div>
          <div className="summary">
            {info.summary}
          </div>
        </div>
        {this.state.showDetails ? <OperationDetail info={info}/> : null}
      </div>
    );
  }
}

class OperationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userParams:  null
    };

    this.onClick = this.onClick.bind(this);
    this.updateUserParams = this.updateUserParams.bind(this);
  }

  updateUserParams(newParams) {
    this.setState({userParams: newParams});
  }

  onClick() {
    //execute the API with the params
    console.log(this.state.userParams);
  }

  render() {
    return (
      <div className="opblock-details">
        <div className="operation-description">
          <b>Description:</b> {this.props.info.description}
        </div>
        <div className="param-title-box">
          <div className="param-title">
            Parameters
          </div>
          <div className="execute-button-wrapper">
            <button className="execute-button" type="button" onClick={this.onClick}>Execute!</button>
          </div>
        </div>
        <OperationParameters params={this.props.info.parameters} updateUserParams={this.updateUserParams}/> 
      </div>
    );
  }
}

class OperationParameters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userParams: {}
    };

    this.updateUserParam = this.updateUserParam.bind(this);
  }

  updateUserParam(paramName, paramValue) {
    let updatedParams = this.state.userParams;
    updatedParams[paramName] = paramValue;
    this.setState({userParams: updatedParams});
    this.props.updateUserParams(updatedParams);
  }

  generateParameters(params) {
    return params.map(param => {
      return <Parameter key={param.name} param={param} updateUserParam={this.updateUserParam}/>
    });
  }

  render() {
    return (
      <table className="param-table">
        <thead className="table-header">
          <tr className="table-header">
            <th className="table-item"> Name </th>
            <th className="table-item description-column"> Description </th>
          </tr>
        </thead>
        <tbody>
          {this.generateParameters(this.props.params)}
        </tbody>
      </table>
    );
  }
}

class Parameter extends React.Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.props.updateUserParam(this.props.param.name, event.target.value);
  }

  render() {
    let param = this.props.param;
    return (
      <tr>
        <td className="table-item name-column">
          <div className="param-name">
            {param.name}
          </div>
          {param.required ? <span className="required"> * required</span> : null}
          {param.type ? <div>{param.type}</div> : null}
        </td>
        <td className="table-item description-column">
          {param.description}
          <textarea className="param-value" onChange={this.onChange}/>
        </td>
      </tr>
    );
  }
}
