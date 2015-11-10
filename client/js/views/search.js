/*
    View logic for the query samples list component
    */
    this.SearchView = Backbone.View.extend({
      tagName: "div",
      id: "search",

  /////////////////////////
  // View Initialization //
  /////////////////////////
  initialize: function() {
    var me;
    me = this;
  },

  //////////////////////////
  //Render Samples Views//
  //////////////////////////
  render: function() {
    Blaze.render(Template.search, $('#sparql-content')[0]);
    this.setEvents($('#sparql-content'));
    return this;
  },
  setEvents: function(divNode) {
    $('button.runSearch').on('click', function(ev) {
      App.resultCollection2.remove({});
      var EntitySearch = get_radio_value("resourceType");

      var FromList = get_checkList_values("repositoriesList");

      var TextSearch = $("#textToSearch").val();
      

      //alert(EntitySearch);
      //alert(TextSearch);
      //alert(FromList);

      var DocSearchRequest = {};


      DocSearchRequest.resourceClass ='http://purl.org/ontology/bibo/Document';
      DocSearchRequest.indexProperties =['http://purl.org/ontology/bibo/abstract', 'http://purl.org/dc/terms/title', 'http://purl.org/dc/terms/subject'];
      DocSearchRequest.indexPropertiesName =['Abstract', 'Title', 'Subject'];
      DocSearchRequest.labelProperty ='http://purl.org/dc/terms/title';

      var AuthSearchRequest = {};

      AuthSearchRequest.resourceClass ='http://xmlns.com/foaf/0.1/Person';
      AuthSearchRequest.indexProperties =['http://xmlns.com/foaf/0.1/name'];
      AuthSearchRequest.indexPropertiesName =['Name'];
      AuthSearchRequest.labelProperty ='http://xmlns.com/foaf/0.1/name';

      var ColSearchRequest = {};

      ColSearchRequest.resourceClass ='http://purl.org/ontology/bibo/Collection';
      ColSearchRequest.indexProperties =['http://purl.org/dc/terms/description'];
      ColSearchRequest.indexPropertiesName =['Description'];
      ColSearchRequest.labelProperty ='http://purl.org/dc/terms/description';


      var ResqLis =[];
        switch(EntitySearch){
          case 't':{
            ResqLis.push(DocSearchRequest);
            ResqLis.push(AuthSearchRequest);
            ResqLis.push(ColSearchRequest);
          }break;
          case 'd':{
            ResqLis.push(DocSearchRequest);
          }break;
          case 'a':{
            ResqLis.push(AuthSearchRequest);
          }break;
          case 'c':{
            ResqLis.push(ColSearchRequest);
          }break;
        }


      var Query="prefix text:<http://jena.apache.org/text#>\n";

      Query+='select ?EntityURI ?EntityClass ?EntityLabel ?Property ?PropertyLabel ?PropertyValue {\n';


      var SubQN=0;
      for (var oneQuery=0; oneQuery<FromList.length; oneQuery++){
        var EndpointLocal=FromList[oneQuery].attributes['data-base'] ? FromList[oneQuery].attributes['data-base'].value : false;
        var Service=FromList[oneQuery].attributes['data-endpoint'].value;
        for (var oneRes=0; oneRes<ResqLis.length; oneRes++){
          for (var oneProp=0; oneProp<ResqLis[oneRes].indexProperties.length; oneProp++){
            SubQN++;
            if(SubQN==1){
              Query+='{\n';
            }else{
              Query+='union {\n';
            }
            
            if (!EndpointLocal){
              Query+='service <'+Service+'> {\n';
            }
            var Class_=ResqLis[oneRes].resourceClass;
            var Property_=ResqLis[oneRes].indexProperties[oneProp];
            var PropertyName_=ResqLis[oneRes].indexPropertiesName[oneProp];
            var Label_=ResqLis[oneRes].labelProperty;

            Query+='select distinct ?Score ?EntityURI (IRI(<'+Class_+'>) AS ?EntityClass) ?EntityLabel (IRI(<'+Property_+'>) AS ?Property) (\''+PropertyName_+'\' AS ?PropertyLabel) ?PropertyValue\n';
            Query+='{\n';
            Query+='(?EntityURI ?Score ?PropertyValue) text:query (<'+Property_+'> \''+TextSearch+'\' ) .\n?EntityURI <'+Label_+'> ?EntityLabel .\n';
            Query+='filter(str(?PropertyValue)!=\'\') .\n';




            Query+='}\n';
            if (!EndpointLocal){
              Query+='}\n';
            }
            Query+='}\n';
          }
        }
      }


      Query+='} order by DESC(?Score)\n';

    alert(Query);
      waitingDialog.show();

      var jsonRequest = {"sparql": Query, "validateQuery": false};
        Meteor.call('doQuery', jsonRequest, function(error, result) {
          if(result.statusCode != 200) {
            console.log(result.stack);
            $('#modalLog .console-log').html(result.stack ? (result.stack.replace(/[<]/g,'&#60;').replace(/[\n\r]/g, '<br/>')):'');
            //$('#sparqlEditor button#consoleError').show();
            var message = result.msg + (result.stack ? (': ' + result.stack.substring(0, 30) + '...'):'');
            $('.top-right').notify({
              message: { text: message },
              type: 'danger'
            }).show();
          } else {
            if(result.resultSet) {
              App.resultCollection2.insert(result.resultSet);
            }
          }
          waitingDialog.hide();
          
        });


    });
  }
});

function get_checkList_values(CheckName) {
            var inputs = document.getElementsByName(CheckName);
            var values=[];
            for (var i = 0; i < inputs.length; i++) {
              if (inputs[i].checked) {
                values.push(inputs[i]);
              }
            }
            return values;
          };

    function get_radio_value(RadioName) {
            var inputs = document.getElementsByName(RadioName);
            for (var i = 0; i < inputs.length; i++) {
              if (inputs[i].checked) {
                return inputs[i].value;
              }
            }
          };





