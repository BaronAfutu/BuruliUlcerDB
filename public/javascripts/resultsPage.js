window.onload = initAll;

function initAll(){
    //alert(navigator.platform);
    let inSet = document.getElementsByName("content");
    let endPoint = inSet.length;
    let content = '';
    for(i=0;i<endPoint;i++){
        //inSet[i].innerHTML=inSet[i].innerHTML.trim();
        content =  inSet[i].innerHTML;
        if(content.indexOf("http")>-1){
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