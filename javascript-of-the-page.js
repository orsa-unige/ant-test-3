/// Retrieves the configuration file
/// Browsers still do not accept "require()"
var config = (function() {
    var cfg = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "./config.json",
        'dataType': "json",
        'success': function (d) {
            cfg = d;
        }
    });
    return cfg;
})();


/// Filling the example form with the parameters taken in the config file.
/// Look: there's nothing in the html tags!
$.each(config.form.example, function(name, val){
    $('[name="'+name+'"]')  /// Seleziono quello con l'attributo name uguale (num1)
    	.prop(val.prop)     /// Ci aggiungo le proprietà (in questo caso valore di default)
    	.attr(val.attr)     /// E gli attributi min, max, eccetera
     	.parent("label")    /// Seleziono l'elemento parente, che è la  label
    	.prepend(val.label)     /// Ci aggiungo il testo
     	.attr("title",val.title)  /// E l'attributo titolo. 
});


/// Retrives form data
$("form").on("submit",function(event){ /// When the Send button is pressed...
    event.preventDefault();       /// Avoids the page to reload on click.
    
    // /// Most simple implementation:
    //
    // var serialized_data = JSON.stringify(
    //   $("form").serializeArray()
    //	);
    //
    /// ...and I have something like:
    /// [{"name":"num1","value":"1"},{"name":"num2","value":"1.2"},{"name":"txt","value":"asd"}]
    
    /// ...but I compact it to avoid every time "name" and "value": {"num1":"1","num2":"1.2","txt":"asd"}
    
    var raw_form_data = {};

    $.each($('form').serializeArray(), function() {
	raw_form_data[this.name] = this.value; 
    });

    /// This javascript manages the actor "telescope observer".
    var whoami="telescope_observer";

    /// So let's find all its properties in the configuration file,
    /// and append it in the raw form data.
    raw_form_data.actor=config.actor.prop.find(function(o){return o.name==whoami});

    var serialized_form_data = JSON.stringify(raw_form_data);

    // /// I put the serialized data into a tag to inspect the input sent
    // /// to the ws server
    // $("aside").text(serialized_form_data)    

    /// Then I send it to the ws server.     
    ws.send(serialized_form_data)
    
}); /// form on submit


/// Let's take some properties of the websocket server:I need the ip and the port
var wss = config.actor.prop.find(function(o){return o.name=="websocket_server"});

/// No need to require(websocket) : browsers natively support it.
var ws = new WebSocket('ws://'+wss.ip
		          +':'+wss.port, 'echo-protocol');

ws.addEventListener("message", function(e) {
    var obj=$.parseJSON(e.data)
    console.log(obj) /// Look in the browser console

// Let's add some style to these informations!
	$("h2 em").text(obj.actor.title) /// it will change depending from the actor
	$("h3 em").text(obj.connection.id) /// it will change depending from the actor
	$("aside").text(obj.actor.description)    	

    switch (obj.actor.name){ /// Depending from the actor, I do several things
    case "dummy_1": 
    case "dummy_2":
	var li= d3.select("ul") /// Some d3! I select the <ul> 
	    .selectAll("li") /// They will be dinamically created 
	    .data(obj.randomnumbers) /// I bind the data to the future <li>
	li.text(function(d){return d})	/// on update the value will change
	li.enter().append("li") /// It will append two new <li> (xx and yy) 
	li.exit().remove() /// it will remove the old ones.	
	// $.each(obj.randomnumbers, function(i){
	//     $("ul").append("li").text(i)
	// })
	break;

    case "telescope_observer":
	$("div").prepend(JSON.stringify(obj)+'<br>')	
 	// $("h2 em").text(obj.actor.title) /// it will change depends from the actor
 	// $("h2 em").text(obj.connection.id) /// it will change depends from the actor
	// $("aside").text(obj.actor.description)    	
	break;

    case "console":
    	$("div").prepend(JSON.stringify(obj)+'<br>')	
        if (obj.enable != undefined){
            console.log("enable!!")
            $(obj.enable).prop("disabled",false)
        }        
        if(obj.disable != undefined) {
            console.log("disable!!!")
            $(obj.disable).prop("disabled",true)
        }
        
    default: 
	break;
    }

});


