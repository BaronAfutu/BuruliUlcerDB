window.onload = initAll;

"use strict";

let prevPage = ()=>{
    let curPage = document.getElementById("pgNumber");
    let curPageNumber = parseInt(curPage.value)-1;
    let startPoint = (curPageNumber-1)*25;
    let endPoint = (curPageNumber)*25;

    let rows = document.getElementsByName("rowData");
    let rowSize = rows.length;

    if(startPoint<0)return;

    for(let i=startPoint;i<endPoint;i++){
        rows [i].style.display="";
    }
    for(let i=endPoint;i<Math.min(endPoint+25,rowSize);i++){
        rows [i].style.display="none";
    }

    curPage.value = curPageNumber;
}

let nextPage = ()=>{
    let curPage = document.getElementById("pgNumber");
    let curPageNumber = parseInt(curPage.value);
    let startPoint = curPageNumber*25;
    let endPoint = (curPageNumber+1)*25;

    let rows = document.getElementsByName("rowData");
    let rowSize = rows.length;
    
    if(startPoint>rowSize)return;
    if(endPoint>rowSize)endPoint=rowSize;
    
    for(let i=startPoint-25;i<startPoint;i++){
        rows [i].style.display="none";
    }
    for(let i=startPoint;i<endPoint;i++){
        rows [i].style.display="";
    }
    curPage.value = curPageNumber + 1;
}

function initAll(){
    //alert(navigator.platform);
    let inSet = document.getElementsByName("textEntry");
    let endPoint = inSet.length;
    let content = '';
    for(i=0;i<endPoint;i++){
        //inSet[i].innerHTML=inSet[i].innerHTML.trim();
        content =  inSet[i].innerHTML;
        if(content.indexOf("http")>-1){
            displayLinks(inSet[i],content);
        }
    }
    document.getElementById("prevBtn").addEventListener("click",prevPage);
    document.getElementById("nxtBtn").addEventListener("click",nextPage);
    let rows = document.getElementsByName("rowData");
    let rowSize = rows.length;
    for(let i=25;i<rowSize;i++){
        rows [i].style.display="none";
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