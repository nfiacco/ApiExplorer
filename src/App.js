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
        let baseUrl = apiData.host + apiData.basePath;
        if (!baseUrl.startsWith("https://")) {
          baseUrl = "https://" + baseUrl;
        }
        content = (
          <div className="wrapper">
            <ApiInfo info={apiData.info}/>
            <Operations baseUrl={baseUrl} paths={apiData.paths}/>
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
        operations.push(<Operation key={path+method} path={path} method={method} info={info} baseUrl={this.props.baseUrl}/>);
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
        {this.state.showDetails ? <OperationDetail url={this.props.baseUrl + path} method={method} info={info}/> : null}
      </div>
    );
  }
}

class OperationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bodyParams: null,
      pathParams: null,
      hasResponse: false,
      response: null
    };

    this.onClick = this.onClick.bind(this);
    this.updateParams = this.updateParams.bind(this);
    this.constructQueryUrl = this.constructQueryUrl.bind(this);
    this.updateResponse = this.updateResponse.bind(this);
  }

  updateParams(newBodyParams, newPathParams) {
    this.setState({
      bodyParams: newBodyParams,
      pathParams: newPathParams,
      hasResponse: this.state.hasResponse,
      response: this.state.response
    });
  }

  constructQueryUrl() {
    let queryUrl = this.props.url;
    for (let param in this.state.pathParams) {
      queryUrl = queryUrl.replace("{"+param+"}", this.state.pathParams[param]);
    }
    return queryUrl;
  }

  updateResponse(response) {
    this.setState({
      bodyParams: this.state.bodyParams,
      pathParams: this.state.pathParams,
      response: response,
      hasResponse: true
    });
  }

  createResponseJson(response, body) {
    let headers = {};
    for(let entry of response.headers.entries()) {
      headers[entry[0]] = entry[1];
    }
    let responseJson = {
      status: response.status,
      headers: JSON.stringify(headers, null, 2),
      body: JSON.stringify(body, null, 2)
    };

    return responseJson;
  }

  onClick() {
    let queryUrl = this.constructQueryUrl();
    switch(this.props.method) {
      case "get":
        fetch(queryUrl)
        .then(r => r.json().then(body => this.createResponseJson(r, body)))
        .then(responseJson => this.updateResponse(responseJson));
        break;
      case "put":
      case "post":
      case "delete":
        // TODO: implement the body parameters and header construction
        break;
      default:
        console.log("error");
    }
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
        <OperationParameters params={this.props.info.parameters} updateParams={this.updateParams}/> 
        {this.state.hasResponse ? <OperationResponse response={this.state.response}/> : null}
      </div>
    );
  }
}

class OperationResponse extends React.Component {
  render() {
    return (
      <div className="response">
        <div className="response-title">Response</div>
        <div className="response-attribute">
          <b>Code: </b>{this.props.response.status}
        </div>
        <div className="response-attribute">
          <b>Headers: </b>
          <div className="response-json">
            {this.props.response.headers}
          </div>
        </div>
        <div className="response-attribute">
          <b>Body: </b>
          <div className="response-json">
            {this.props.response.body}
          </div>
        </div>
      </div>
    );
  }
}

class OperationParameters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pathParams: {},
      bodyParams: {}
    };

    this.updateBodyParam = this.updateBodyParam.bind(this);
    this.updatePathParam = this.updatePathParam.bind(this);
  }

  updateBodyParam(paramName, paramValue) {
    let updatedParams = this.state.bodyParams;
    updatedParams[paramName] = paramValue;
    this.setState({
      bodyParams: updatedParams,
      pathParams: this.state.pathParams
    });
    this.props.updateParams(updatedParams, this.state.pathParams);
  }

  updatePathParam(paramName, paramValue) {
    let updatedParams = this.state.pathParams;
    updatedParams[paramName] = paramValue;
    this.setState({
      pathParams: updatedParams,
      bodyParams: this.state.bodyParams
    });
    this.props.updateParams(this.state.bodyParams, updatedParams);
  }

  generateParameters(params) {
    return params.map(param => {
      return <Parameter key={param.name} param={param} updatePathParam={this.updatePathParam} updateBodyParam={this.updateBodyParam}/>
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
    if (this.props.param.in === "path") {
      this.props.updatePathParam(this.props.param.name, event.target.value);
    } else {
      this.props.updateBodyParam(this.props.param.name, event.target.value);
    }
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
