/**
 * Created by Ankush on 4/9/2016.
 */

var context ={
    error:{

    }
};

function CustomList(configObj){
    context.orderBy = configObj.orderBy?configObj.orderBy: "body";
    if(configObj.JSONURL){
        context.JSONURL = configObj.JSONURL;
    }else{
        throw "URL or JSON File Path is required!!";
    }

}

CustomList.prototype.createElem = function(){
    var newsListContext = {};

    //Inherit from base HTMLELEMENT --> change it extend from DIV or UL if templating doesn't work out well
    newsListContext.newsElemProto = Object.create(HTMLElement.prototype);

    
    //Call Back will fire once the element has been loaded into the dom
    newsListContext.newsElemProto.attachedCallback = function(){
        var shadow = this.createShadowRoot();
        context.getJSON(
            //success call back
            function(request){
            context.JSONObject = JSON.parse(request.responseText);
            var temp = context.JSONObject;

            //sort array by configurable property passed by the user
            temp.sort(compare);

            context.templateData = {};
            context.templateData.JSONObjectForTemplate = temp;

            $.get("../NewsCorpComponent/src/templates/ListBuilder.html", function(templates){
                var template = $(templates).filter("#listBuilder").html();
                var formedHtml = Mustache.render(template, context.templateData);
                shadow.innerHTML = formedHtml;
            });


        }, errorHandler);
    };

    //check if the element is already registered before ,
    // code used here for n number of instances of the element to be created, could have written a callback as well
    if(!isRegistered("news-list")){
        newsListContext.NewsList = document.registerElement("news-list",{
            prototype: newsListContext.newsElemProto
        });
    }

    var newNewsList = document.createElement("news-list");

    document.body.appendChild(newNewsList);
};

function isRegistered(name){
    return document.createElement(name).constructor !== HTMLElement;
}

context.getJSON = function(successCallBack, errorCallBack){
    var request = new XMLHttpRequest();
    console.log(context.JSONURL);
    //pass true as third param to ensure the call is async
    request.open("GET", context.JSONURL, true);
    request.send(null);

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            //call back to process data once request has resolved with status 200
            successCallBack(request);
        }else if(request.readyState === 4 && request.status == 404){
            errorCallBack(request);
        }
    };

};


// failure error callback
function errorHandler(request){
    context.error.JSONError ="Unable to fetch data";
}

function compare(a,b){
    if (a[context.orderBy] < b[context.orderBy])
        return -1;
    else if (a[context.orderBy] < b[context.orderBy])
        return 1;
    else
        return 0;
}

//Testing the initial setup
var elem = new CustomList({
    JSONURL: "dummy.json"
});

elem.createElem();

