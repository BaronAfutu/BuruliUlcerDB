window.onload = initAll;

function initAll(){
    //alert(navigator.platform);
}

let checkValues = (theForm)=>{
    let search_val = theForm['search_val'].value;
    let group = theForm['group'].value;
    if(search_val==''){ 
        document.getElementById('errorStat').innerHTML = 'Enter Keyword(s)';
        return false;
    }
    else if(group==''){
        document.getElementById('errorStat').innerHTML = 'Select a Group';
        return false;
    }
    return true;
}