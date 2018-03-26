var express = require('express');
var app = express();
var fs = require("fs");
var execKC = require('child_process').exec;

var optionsKC = {cwd:"/home/pi/wiringPi/examples/lights",shell: "true"}

var errorMessage = {"Error":{"Message":"ID is not known"}};
var errorMessage1 = {"Error":{"Message":"status is not a true of false"}};

function kakuCommand(kakuStatus,kakuLetter,kakuNumber)
{
	var correctStatus = kakuStatus == "true" || kakuStatus == "false";
	if(correctStatus)
	{
		var command = "./kaku "+kakuNumber+" "+kakuLetter + " ";
		if(kakuStatus == "true")
		{
			command = command + "on"
		}
		else if(kakuStatus == "false")
		{
			command = command + "off"
		}
		console.log(command);
		execKC(command,optionsKC,function(err,stdout,stderr)
		{
			if(err)
			{
				console.log(err);
			}
		});
	}
}

function lightCommand(lightStatus)
{
    var correctStatus = lightStatus == "true" || lightStatus == "false";
    if(correctStatus)
    {
        var command = "./light ";
        if(lightStatus == "true")
        {
            command = command + "on"
        }
        else if(lightStatus == "false")
        {
            command = command + "off"
        }
        console.log(command);
        execKC(command,optionsKC,function(err,stdout,stderr)
        {
            if(err)
            {
                console.log(err);
            }
        });
    }
}

app.get('/removeKaku/:id',function(req,res)
{
	var id = req.params.id;
	
	fs.readFile(__dirname+"/"+"kakuData.json",'utf8',function(err,data)
	{
		if(err)console.log(err);
		
		data = JSON.parse(data);
		
		if(!isNaN(id))
		{
			var found = false;
			var index = -1;
			
			for(index =0; index<data["kakus"].length; index++)
		    {
			   if(data["kakus"][index]["id"] == id)
			   {
				   found = true;
				   break;
			   }
		    }
			
			if(found)
			{
				console.log("removing: "+data["kakus"][index]["id"])
				data["kakus"].splice(index,1);
				data = JSON.stringify(data);
				fs.writeFile(__dirname + "/" + "kakuData.json", data, function(err){
				   if(err)
				   {
						console.log(err); 
				   }		   
				});
				console.log(data);
			}
			else
			{
				data = JSON.stringify(data);
			}
		}
		else{data = JSON.stringify(data);}
		res.end(data);
	});
})

app.get('/addKaku/:id/:id_letter/:id_number/:location', function (req, res) {
	
	var id = req.params.id;
	var letter = req.params.id_letter;
	var number = req.params.id_number;
	var loc = req.params.location;
	
	console.log(id + " " + letter + " " + number + " "+loc);
	
   // First read existing users.
    fs.readFile( __dirname + "/" + "kakuData.json", 'utf8', function (err, data) {	   
       if(err)
	   {
		   console.log(err);
	   }
	   
	   data = JSON.parse( data );
	   var found = false;
	   
	   for(var i =0; i<data["kakus"].length; i++)
	   {
		   if(data["kakus"][i]["id"] == id)
		   {
			   found = true;
			   break;
		   }
	   }
	   
	   console.log("KAKU " + data["Kaku"+id]);
	   
	   if(!found && !isNaN(id) && !isNaN(number))
	   {
		   console.log("Adding data" + id);
		   
			data["kakus"][data["kakus"].length] = {	"id":id, "idletter":letter,"idnumber":number,"status":"false","location":loc};
			console.log( data );
			data = JSON.stringify(data);
			fs.writeFile(__dirname + "/" + "kakuData.json", data, function(err){
			   if(err)
			   {
					console.log(err); 
			   }		   
		   });
	   }
	   else{data = JSON.stringify(data);}   
       res.end( data );
    });
})

app.get('/updateKaku/:id/:newLetter/:newNumber/:newStatus/:newLocation',function (req, res){
	var id = req.params.id;
	var newL = req.params.newLetter;
	var newN = req.params.newNumber;
	var newS = req.params.newStatus;
	var newLoc = req.params.newLocation;
	
	console.log(id +" "+newL+" "+newN+" "+newS+" "+newL);
	
	console.log("before read file");
	fs.readFile( __dirname + "/" + "kakuData.json", 'utf8', function (err, data){
		if(err)
		{
		   console.log(err);
		}
		data = JSON.parse(data);
		
	   var found = false,correctStatus;
	   
	   var index = -1;
	   
	   for(var i =0; i<data["kakus"].length; i++)
	   {
		   if(data["kakus"][i]["id"] == id)
		   {
			   found = true;
			   index = i;
			   break;
		   }
	   }
		
		correctStatus = newS == "true" || newS == "false";
		
		if(found && !isNaN(id) && !isNaN(newN) && correctStatus)
		{
			console.log("update kaku: "+id);
			data["kakus"][index]["idletter"] = newL;
			data["kakus"][index]["idnumber"] = newN;
			data["kakus"][index]["status"] = newS;			
			kakuCommand(newS,newL,newN);			
			data["kakus"][index]["location"] = newLoc;
			console.log("upated kaku: "+id)
			
			data = JSON.stringify(data);
			fs.writeFile(__dirname + "/" + "kakuData.json", data, function(err){
			   if(err)
			   {
					console.log(err); 
			   }		   
		   });
		}
		else
		{
			if(!found)
			{
				data = errorMessage;
			}
			else if(!found)
			{
				data = errorMessage1
			}	
			data = JSON.stringify(data);			
		}		
		console.log(data);		
		res.end(data);	
	});
})	

app.get('/getKakus', function (req, res) {
   fs.readFile( __dirname + "/" + "kakuData.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

app.get('/lux/get', function (req, res) {
   fs.readFile( __dirname + "/" + "serverData.json", 'utf8', function (err, data) {
	   data = JSON.parse(data);
       console.log( data );	   
	   data = JSON.stringify(data["ServerData"][0]);
       res.end( data );
   });
})

app.get('/lux/update/:value',function(req,res)
{
	var newValue = req.params.value;
	fs.readFile( __dirname + "/" + "serverData.json", 'utf8', function (err, data) {
	   data = JSON.parse(data);
	   
	   if(!isNaN(newValue))
	   {		   
			data["ServerData"][0]["Luxvalue"] = newValue;
			console.log("upated server data: "+0)
			
			data = JSON.stringify(data);
			fs.writeFile(__dirname + "/" + "serverData.json", data, function(err){
			   if(err)
			   {
					console.log(err); 
			   }		   
		   });
	   }
	   else{ data = JSON.stringify(data);}	   
	   
	   console.log( data );
       res.end( data );
   });
})


app.get('/getKaku/:id', function (req, res) 
{
	var id = req.params.id;
	
	fs.readFile(__dirname + "/" +"kakuData.json", 'utf8', function(err,data)
	{
		data = JSON.parse(data);
		
		var found = false;
	   
	   for(var i =0; i<data["kakus"].length; i++)
	   {
		   if(data["kakus"][i]["id"] == id)
		   {
			   data = data["kakus"][i];
			   found = true;
			   break;
		   }
	   }
	   
	   if(!found)
	   {
		   data = errorMessage;
	   }
		
		console.log(data);
		data = JSON.stringify(data);
		res.end(data);
	})
})

app.get('/getLight/:id', function (req,res){

	var id=req.params.id;

    fs.readFile(__dirname + "/" +"lightData.json", 'utf8', function(err,data)
    {
        data = JSON.parse(data);

        var found = false;

        for(var i =0; i<data["lights"].length; i++)
        {
            if(data["lights"][i]["id"] == id)
            {
                data = data["lights"][i];
                found = true;
                break;
            }
        }

        if(!found)
        {
            data = errorMessage;
        }

        console.log(data);
        data = JSON.stringify(data);
        res.end(data);
    })
})

app.get('/updateLight/:id/:newStatus', function (req,res){
    var id = req.params.id;
    var newStatus = req.params.newStatus;

    console.log(id + " " + newStatus);

    console.log("before read file");
    fs.readFile( __dirname + "/" + "lightData.json", 'utf8', function (err, data){
        if(err)
        {
            console.log(err);
        }
        data = JSON.parse(data);

        var found = false,correctStatus;

        var index = -1;

        for(var i =0; i<data["lights"].length; i++)
        {
            if(data["lights"][i]["id"] == id)
            {
                found = true;
                index = i;
                break;
            }
        }

        correctStatus = newStatus == "true" || newStatus == "false";

        if(found && !isNaN(id) && correctStatus)
        {
            console.log("update light: "+id);
            data["lights"][index]["status"] = newStatus;
            lightCommand(newStatus);
            console.log("upated light: "+id)

            data = JSON.stringify(data);
            fs.writeFile(__dirname + "/" + "lightData.json", data, function(err){
                if(err)
                {
                    console.log(err);
                }
            });
        }
        else
        {
            if(!found)
            {
                data = errorMessage;
            }
            else if(!found)
            {
                data = errorMessage1
            }
            data = JSON.stringify(data);
        }
        console.log(data);
        res.end(data);
    });
})




var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
