window.onload = initAll;

function initAll(){
    //alert(navigator.platform);
    let inSet = document.getElementsByName("content");
    let endPoint = inSet.length;
    let content = '';
    let contentID = '';
    for(i=0;i<endPoint;i++){
        contentID = inSet[i].id;
        content =  inSet[i].innerHTML;
        
        switch (contentID) {
            case 'drug_bank_id':
                displayTextLink(inSet[i],content,'https://go.drugbank.com/drugs/');
                break;
            case 'uniport_id':
                displayTextLink(inSet[i],content,'https://www.uniprot.org/uniprot/');
                break;
            case 'string':
                displayTextLink(inSet[i],content,'https://string-db.org/network/');
                break;
            case 'go_mole_func':
            case 'go_bio_process':
                content = content.split(/\s+/).join(',');
                displayTextLink(inSet[i],content,'https://www.ebi.ac.uk/QuickGO/term/');
                break;
            case 'kegg_pathway':
                displayTextLink(inSet[i],content,'https://www.genome.jp/dbget-bin/www_bget?');
                break;
            case 'cid':
                displayTextLink(inSet[i],content,'https://pubchem.ncbi.nlm.nih.gov/compound/');
                break;
            case 'external_links':
                splitLinks(inSet[i],content);
                break;
            case 'reference_links':
                displayTextLink(inSet[i],content,'https://pubmed.ncbi.nlm.nih.gov/');
                break;
            case 'genome_id':
                displayTextLink(inSet[i],content,'https://www.ncbi.nlm.nih.gov/genome/504?genome_assembly_id=');
                break;
            case 'bio_id':
                displayTextLink(inSet[i],content,'https://www.ncbi.nlm.nih.gov/biosample/');
                break;
            case 'bioproject':
                displayTextLink(inSet[i],content,'https://www.ncbi.nlm.nih.gov/bioproject/');
                break;
            case 'gen_asmb_id':
                displayTextLink(inSet[i],content,'https://www.ncbi.nlm.nih.gov/assembly/');
                break;
            case 'taxonomy':
                displayTextLink(inSet[i],content,'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=');
                break;
            case 'biocyc':
                displayTextLink(inSet[i],content,'https://biocyc.org/organism-summary?object=');
                break;
            case 'uniport_prot':
                displayTextLink(inSet[i],content,'https://www.uniprot.org/proteomes/');
                break;
            case 'kegg_gen':
                displayTextLink(inSet[i],content,'https://www.genome.jp/entry/');
                break;
            /*case 'drug_bank_id':
                displayTextLink(inSet[i],content,'');
                break;
                */
        
            default:
                if(content.indexOf("http")>-1){
                    displayLinks(inSet[i],content);
                }
                break;
        }
        //inSet[i].innerHTML=inSet[i].innerHTML.trim();
    }
}

/**
 * 
 * @param {HTMLElement} container 
 * @param {string} content 
 */
let displayLinks = (container,content)=>{
    let paragraphs = content.split(/\n/);
    let result = "";

    paragraphs.forEach((paragraph)=>{
        let textGroups = paragraph.split('http');
        for(let text of textGroups){
            if(text.indexOf("//")==-1)result+=text;//not a link
            else{
                let link = text.split(' ')[0].trim();
                if(link!="nan")result+='<a href="http' + link + '" target="_blank">http' + link + '</a><br>';
            }
        }
    })
    container.innerHTML = result;
}


/**
 * @param {HTMLElement} container,
 * @param {string} content
 * @param {string} url
 */
let displayTextLink = (container,content,url)=>{
    let links = content.split(',');
    let result = "";
    for(let link of links){
        result+=`- <a href="${url}${link}" target="_blank">${link}</a><br>`;
    }
    container.innerHTML=`${result}`;
}

/**
 * 
 * @param {HTMLElement} container
 * @param {string} content
 */
let splitLinks = (container,content)=>{
    let paragraphs = content.split(/\n/);
    paragraphs = paragraphs.filter(word => word.length > 0);
    let result = "";
    paragraphs.forEach((paragraph)=>{
        let texts = paragraph.split(' ');
        let preWord = texts[0];
        let linkKey = texts[texts.length-1];
        
        if(linkKey.match(/^HMDB[0-9*]/)){
            texts[texts.length-1] = `<a href="https://hmdb.ca/metabolites/${linkKey}" target="_blank">${linkKey}</a>` 
            //console.log("Human "+linkKey);
        }
        else if(linkKey.match(/^CHEMBL[0-9*]/)){
            texts[texts.length-1] = `<a href="https://www.ebi.ac.uk/chembl/compound_report_card/${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(linkKey.match(/^ZINC[0-9*]/)){
            texts[texts.length-1] = `<a href="https://zinc.docking.org/substances/${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(linkKey.match(/^DNC|DAP[0-9*]/)){
            texts[texts.length-1] = `<a href="http://bidd.nus.edu.sg/group/cjttd/ZFTTDDRUG.asp?ID=${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(linkKey.match(/^PA[0-9*]/)){
            texts[texts.length-1] = `<a href="https://www.pharmgkb.org/drug/${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(linkKey.match(/^D[0-9*]/)){
            texts[texts.length-1] = `<a href="https://www.genome.jp/dbget-bin/www_bget?drug:${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(linkKey.match(/^C[0-9*]/)){
            texts[texts.length-1] = `<a href="https://www.genome.jp/dbget-bin/www_bget?cpd:${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(linkKey.indexOf('http')>-1){
            texts[texts.length-1] = `<a href="${linkKey}" target="_blank">${linkKey}</a>` 
        }
        else if(texts[1]=="Compound"){
            texts[texts.length-1] = `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(texts[1]=="Substance"){
            texts[texts.length-1] = `<a href="https://pubchem.ncbi.nlm.nih.gov/substance/${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="ChemSpider"){
            texts[texts.length-1] = `<a href="https://www.chemspider.com/Chemical-Structure.${linkKey}.html" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="BindingDB"){
            texts[texts.length-1] = `<a href="http://www.bindingdb.org/bind/chemsearch/marvin/MolStructure.jsp?monomerid=${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="RxNav"){
            texts[texts.length-1] = `<a href="https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="ChEBI"){
            texts[texts.length-1] = `<a href="https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="PDBe"){
            texts[texts.length-1] = `<a href="https://www.ebi.ac.uk/pdbe-srv/pdbechem/chemicalCompound/show/${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="GtoPdb"){
            texts[texts.length-1] = `<a href="https://www.guidetopharmacology.org/GRAC/LigandDisplayForward?ligandId=${linkKey}" target="_blank">${linkKey}</a>`
        }
        else if(preWord=="Wikipedia"){
            texts[texts.length-1] = `<a href="https://en.wikipedia.org/wiki/${linkKey}" target="_blank">${linkKey}</a>`
        }
        /*else if(preWord=="PDBe"){
            texts[texts.length-1] = `<a href="https://www.rxlist.com/script/main/notfoundstatic.asp?refurl=/cgi/generic/clarith.htm${linkKey}" target="_blank">${linkKey}</a>`
        }*/
        result+=(texts.join(' ')+'<br>');
    });
    
    container.innerHTML = result;
}