var React = require('react');
var bs = require('react-bootstrap');
var Row = bs.Row;
var Col = bs.Col;
var Input = bs.Input;
var CorpusSelector = require('../corpora/CorpusSelector.js');
var TargetSelector = require('./TargetSelector.js');
var SuggestQueryButtonGroup = require('./SuggestQueryButtonGroup.js');
const AuthStore = require('../../stores/AuthStore.js');

var SearchForm = React.createClass({
  propTypes: {
    config: React.PropTypes.object.isRequired,
    corpora: React.PropTypes.array.isRequired,
    selectedCorpusNames: React.PropTypes.object.isRequired, // This is a linkState.
    handleSubmit: React.PropTypes.func.isRequired,
    makeUri: React.PropTypes.func.isRequired,
    query: React.PropTypes.object.isRequired,
    target: React.PropTypes.object,
    buttonAfterQuery: React.PropTypes.element,
    showQuerySuggestions: React.PropTypes.bool
  },

  showQuerySuggestions: function() {
    if(this.props.showQuerySuggestions === undefined)
      return !this.props.config.value.ml.disable;
    else
      return this.props.showQuerySuggestions;
  },

  render: function() {
    var self = this;
    var config = this.props.config;
    var queryWidth = (this.showQuerySuggestions()) ? 8 : 10;
    queryWidth = (this.props.target) ? queryWidth : queryWidth + 2;
    var querySuggestions = this.showQuerySuggestions() ?
      <Col xs={2}>
        <SuggestQueryButtonGroup
          config={config}
          target={this.props.target}
          query={this.props.query}
          makeUri={this.props.makeUri}
          disabled={this.props.selectedCorpusNames.value.length == 0}
          submitQuery={this.props.handleSubmit} />
       </Col> :
       null;

    var toggleCorpora = function(corpusIndex) {
      var toggledCorpusName = self.props.corpora[corpusIndex].name;
      var selectedCorpusNames = self.props.selectedCorpusNames.value;
      var remove = selectedCorpusNames.indexOf(toggledCorpusName) >= 0;
      var newSelectedCorpusNames = [];
      selectedCorpusNames.forEach(function(corpusName) {
        if(!(remove && corpusName == toggledCorpusName))
          newSelectedCorpusNames.push(corpusName);
      });
      if(!remove)
        newSelectedCorpusNames.push(toggledCorpusName);
      self.props.selectedCorpusNames.requestChange(newSelectedCorpusNames);
    };

    return (
      <div>
        <form onSubmit={this.props.handleSubmit}>
          <Row>
            {(this.props.target) ? <Col xs={2}><TargetSelector target={this.props.target}/></Col> : null}
            <Col xs={queryWidth}>
            <CorpusSelector
               corpora={this.props.corpora}
               selectedCorpusNames={this.props.selectedCorpusNames.value}
               toggleCorpora={toggleCorpora} />
            <Input
              type="text"
              placeholder="Enter Query"
              label="Query"
              valueLink={this.props.query}
              disabled={this.props.selectedCorpusNames.value.length == 0}
              buttonAfter={this.props.buttonAfterQuery} />
            </Col>
            {querySuggestions}
          </Row>
        </form>
      </div>
    );
  }
});
module.exports = SearchForm;
