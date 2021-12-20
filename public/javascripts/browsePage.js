$(document).ready(function(){       //Pagination Automation
    setLinks();
    $('#browseTable').DataTable({
        "responsive": true,
        //"processing": true,        
        "lengthMenu":[[10,25,50,100,-1],[10,25,50,100,"All"]]
    });
});

//window.onload = setLinks;

"use strict";

function setLinks(){
    let inSet = document.getElementsByName("textEntry");
    let endPoint = inSet.length;
    let content = '';
    for(i=0;i<endPoint;i++){
        //inSet[i].innerHTML=inSet[i].innerHTML.trim();
        content =  inSet[i].innerHTML;
        if(content.indexOf("http")>-1 && content.indexOf("uniprot")==-1 && content.indexOf("drugbank")==-1){
            displayLinks(inSet[i],content);
        }
    }
}

let displayLinks = (container,content)=>{
    let links = content.split(',');
    let lsize = links.length;
    let link = "";
    container.innerHTML = "";
    for(let i=0; i<lsize; i++){
        link = links[i].trim();
        if(link!="nan"){
            container.innerHTML += '<a href="' + link + '" target="_blank">' + link + '</a><br>';
        }
    }
}