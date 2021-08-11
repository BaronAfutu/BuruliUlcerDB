window.onload = initAll;

function initAll(){
    let groupSelector =  document.getElementById("groupSelector");
    groupSelector.addEventListener('change',changeForm);
}

let changeForm= ()=>{
    let formId =  document.getElementById("groupSelector").value;
    let forms = document.getElementsByName("entryForm");
    let fl = forms.length;
    for(let i=0;i<fl;i++){
        if(forms[i].id==formId)forms[i].style.display="block";
        else forms[i].style.display="none";
    }
}