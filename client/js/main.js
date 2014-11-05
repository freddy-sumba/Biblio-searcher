
if (Meteor.isClient) {
  
  this.App = {};
  this.Graphs = new Meteor.Collection("graphs");
  this.Properties = new Meteor.Collection("properties");
  this.Prefixes = new Meteor.Collection("prefixes");
  this.Endpoints = new Meteor.Collection("endpoints");
  this.Queries = new Meteor.Collection("queries");

  
  Template.endpoint.helpers({
      endpointEntity: function(){
        //var entities = Properties.find({},{fields: {'subjects': 1, _id: 1}}).fetch();
        var endpoints = Session.get('endpoints');
        var response = [];
        
        response.status = 'EMPTY';
        if(endpoints && endpoints.length > 0) {
          console.log('==Si existen edpoints');
          response.status = 'OK';
          endpoints.forEach(function(obj) {
            var graph = {};
            graph.name = obj.name
            graph.colorid = obj.colorid;
            graph.endpoint = obj.endpoint;
            graph.graphURI = obj.graphURI;
            graph.description = obj.description;
            var entities = Properties.find( {endpoint: obj.endpoint, 
                                           graphURI: obj.graphURI} 
                                          ).fetch();
            var properties = entities;
            entities = _.pluck(entities, 'subjects');
            //console.log('==encontrados: ' + entities.length);
            var values = [];
            for(var i=0; i<entities.length; i++) {
              values = _.union(values, entities[i]);
            }
            graph.endpointEntities = _.uniq(values, false, function(obj){return obj.fullName;});
            graph.endpointProperties = properties;
            Session.set(graph.endpoint + '|' + graph.graphURI, {entities: graph.endpointEntities, properties: graph.endpointProperties});
            response.push(graph);
            //console.log(graph);
          });
          
          /*var entities = Properties.find( {endpoint: {$in :_.pluck(endpoints, 'endpoint')}, 
                                           graphURI: {$in: _.pluck(endpoints, 'graphURI')}}, 
                                          {sort: {endpoint: -1, graphURI: -1}}).fetch();
          entities = _.pluck(entities, 'subjects');
          var values = [];
          for(var i=0; i<entities.length; i++) {
            values = _.union(values, entities[i]);
          }
          response.status = 'OK';
          response.endpointEntities = _.uniq(values, false, function(obj){return obj.fullName;});
          response.endpointProperties = entities;
          Session.set('entities', entities);*/
          Session.set('graphs', response);
        }
        //console.log(response);
        return response;
        //return _.uniq(values, false, function(obj){return obj.fullName;});
      }/*,

      endpointProperty: function(){
          Session.set('properties', Properties.find().fetch());
          console.log('#### : ' + Properties.find().fetch().length);
          return Properties.find();
        }*/
    });

  Template.hello.greeting = function() {
    return "Hello from sparqlfedquery";
  }

  Template.hello.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.hello.events({
    'click button': function () {
      console.log('just a test');
    }
  });

  Meteor.startup(function() {
    console.log('inicializacion');
    return $(function() {
      App.router = new Router();
      console.log('inicializacion OK');
      return Backbone.history.start({
        pushState: true
      });
    });
  });
}