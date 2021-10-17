var express = require('express');
var dbConnect = require('../bin/db');
var syncSql = require('sync-sql');
var config = require('../bin/dbConfig.json');
var router = express.Router();
require('dotenv').config({ path: './.env' });

if(process.env.ENV){
  config = {
    "host"     : process.env.SERVER,
    "user"     : process.env.USER_NAME,
    "password" : process.env.PASSWORD,
    "database" : process.env.DBNAME
  }
  //console.log(config);
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Buruli Ulcer Database' });
});




router.get('/any/results',async (req,res)=>{
  let search_val = req.query.search_val;
  var retrivedResults = [];
  
  let cndtn1 = "id LIKE '%"+search_val+"%' OR drug_target LIKE '%"+search_val+"%' OR genes LIKE '%"+search_val+"%' OR amp LIKE '%"+search_val+"%' OR functions LIKE '%"+search_val+"%' OR uniport_id LIKE '%"+search_val+"%' OR reference LIKE '%"+search_val+"%' OR links LIKE '%"+search_val+"%'";
  let cndtn2 = "id LIKE '%"+search_val+"%' OR species LIKE '%"+search_val+"%' OR family LIKE '%"+search_val+"%' OR country LIKE '%"+search_val+"%' OR part LIKE '%"+search_val+"%' OR extraction LIKE '%"+search_val+"%' OR solvents LIKE '%"+search_val+"%' OR metabolites LIKE '%"+search_val+"%' OR antimicro_mthds LIKE '%"+search_val+"%' OR activity LIKE '%"+search_val+"%' OR liver_cell LIKE '%"+search_val+"%' OR reference LIKE '%"+search_val+"%' OR links LIKE '%"+search_val+"%'";
  let cndtn3 = "id LIKE '%"+search_val+"%' OR mycobacterium LIKE '%"+search_val+"%' OR exist_database LIKE '%"+search_val+"%' OR gene_info LIKE '%"+search_val+"%' OR pro_gene_stats LIKE '%"+search_val+"%' OR accession LIKE '%"+search_val+"%' OR source LIKE '%"+search_val+"%' OR reference LIKE '%"+search_val+"%' OR ncbi LIKE '%"+search_val+"%' OR links LIKE '%"+search_val+"%' OR article LIKE '%"+search_val+"%' OR genome_link LIKE '%"+search_val+"%'";
  let cndtn4 = "id LIKE '%"+search_val+"%' OR test_compound LIKE '%"+search_val+"%' OR mic LIKE '%"+search_val+"%' OR ic50 LIKE '%"+search_val+"%' OR technique LIKE '%"+search_val+"%' OR structure LIKE '%"+search_val+"%' OR m_weight LIKE '%"+search_val+"%' OR drug_target LIKE '%"+search_val+"%' OR properties LIKE '%"+search_val+"%' OR cid LIKE '%"+search_val+"%' OR drug_bank_id LIKE '%"+search_val+"%' OR reference LIKE '%"+search_val+"%'";
  let cndtn5 = "id LIKE '%"+search_val+"%' OR drugs LIKE '%"+search_val+"%' OR class LIKE '%"+search_val+"%' OR targets LIKE '%"+search_val+"%' OR mechanism LIKE '%"+search_val+"%' OR pharmacodynamics LIKE '%"+search_val+"%' OR mode LIKE '%"+search_val+"%' OR inhibitors LIKE '%"+search_val+"%' OR drug_bank_id LIKE '%"+search_val+"%' OR links LIKE '%"+search_val+"%' OR reference LIKE '%"+search_val+"%' OR reference_links LIKE '%"+search_val+"%'";

  /*let queries = {
    drug_target : "SELECT id,drug_target from drug_target where drug_target LIKE '%" + search_val + "%' ",
    ethnopharmacological : "SELECT id,species from ethnopharmacological where species LIKE '%" + search_val + "%' ",
    genome : "SELECT id,mycobacterium from genome where mycobacterium LIKE '%" + search_val + "%' ",
    test_compounds : "SELECT id,test_compound from test_compounds where test_compound LIKE '%" + search_val + "%' ",
    existing_drugs : "SELECT id,drugs from existing_drugs where drugs LIKE '%" + search_val + "%' "
  };*/
  let queries = {
    drug_target : "SELECT id,drug_target,functions from drug_target where ("+cndtn1+")",
    ethnopharmacological : "SELECT id,species,solvents,metabolites from ethnopharmacological where ("+cndtn2+")",
    genome : "SELECT id,mycobacterium,gene_info,pro_gene_stats from genome where ("+cndtn3+")",
    test_compounds : "SELECT id,test_compound,properties,drug_target from test_compounds where ("+cndtn4+")",
    existing_drugs : "SELECT id,drugs,mechanism,pharmacodynamics from existing_drugs where ("+cndtn5+")"
  };

  for(qry in queries){
    let output = syncSql.mysql(config,queries[qry]);
    let error = output.success==false;
    let results = output.data.rows;
    let fields = output.data.fields;
    
    if(error)res.render('error');
    let resSize = results.length;

    if(resSize>0){

      let searchHit = "";   //Getting matched results
      for(let i=0;i<resSize;i++){
        searchHit = "";
        for(x in results[i]){
          if(x=="id"){
            continue;
          }
          let searchIndex = results[i][x].indexOf(search_val);
          if (searchIndex>-1){
            searchHit = "..."+ results[i][x].substring(searchIndex-40,searchIndex+search_val.length+40);
          }
        }
        if(searchHit=="")searchHit="found within detailed information";
        results[i]["matched"] = searchHit;
      }

      for( result of results){
        retrivedResults.push({
          id: result['id'],
          resName: result[fields[1].name],
          group: qry,
          matched: result['matched']
        });
      }
    }
  }

  //when several results are fetched
  let resSize = retrivedResults.length;
  if(resSize==0){
    //no results found
    res.status(200);
    return res.render('noResults',{
      title : 'Not Found - BUDB',
      sv : search_val
    });
  }
  else if(resSize==1){
    //Single result retrieved
    let result =  retrivedResults[0];
    res.redirect(`/results/${result.group}/${result.id}`);
  }
  else{
    //more results retrived
    res.status(200);
    res.render('multipleResultsAny',{
      title : search_val + ' - BUDB',
      sv : search_val,
      results : retrivedResults,
      resultsSize : resSize
    })
  }
})


router.post('/addEntry/:group', (req,res)=>{
  //console.log(req.params.group)
  if(!req.params.group){res.render('error',{title: "Error Page"})}
  let i=0;
  let addData = [];
  let addDataStr = "";
  let entry = req.body;
  for(x in entry){
    //console.log(`${x}: ${entry[x]}`);
    if(i==0 && entry[x]==''){
      res.render('error',{errMsg: "The first field in the form cannot be empty!!"})
      //console.log(`${x} cannot be empty`);
    }
    else{
      addData.push(entry[x]);
    }
  }
  addDataStr = addData.join(',');
  
  let qry = "INSERT INTO " + req.params.group + " VALUES (" + addDataStr + ")";
  //console.log(qry);

  dbConnect.query(qry,function(err,results,fields){
    if(err)throw err;
    res.render()
  });
  //console.log(addDataStr);
})

//have to sanitize inputs here too
router.get('/results/:group/:id',(req,res)=>{
  let group = req.params.group;
  let id = req.params.id;

  let qry = "SELECT * from " + group + " where id = '" + id + "'";

  dbConnect.query(qry,function(err,results,fields){
    if(err)throw err;

    let resSize = results.length;
    if(resSize==0){
      //no results found
      res.status(200);
      return res.render('noResults',{
        title : 'Not Found - BUDB',
        sv : search_val
      });
    }
    else if(resSize==1){
      //Single result retrieved
      res.status(200);
      return res.render('resultsPage',{
        title:results[0][fields[1].name] + ' - BUDB',
        resName:results[0][fields[1].name],
        group:group,
        result:results[0]
      });
    }
  });
});


//Middleware for search values
//Sanitization will occur here
router.use('/results',(req,res,next)=>{
  try {
    let {search_val,group} = req.query;
    if(!group || search_val=='')return res.render('error');
  }
  catch(err) {return res.render('error');}
  next();
})

//Deep Fetching results
router.get('/results',(req,res)=>{
  //let cont = true;
  let {search_val,group} = req.query;
  
  let col = {
    drug_target : 'drug_target',
    ethnopharmacological : 'species',
    genome : 'mycobacterium',
    test_compounds : 'test_compound',
    existing_drugs : 'drugs'
  }

  let qry1 = "SELECT * from " + group + " LIMIT 1";
  let qryCond = "";

  let output = syncSql.mysql(config,qry1);
  let error = output.success==false;
  let results = output.data.rows;
  let fields = output.data.fields;

  if(error)res.render('error');
  for(x in results[0]){
    qryCond+=" "+x+" LIKE '%"+search_val+"%' OR";
  }
  qryCond = qryCond.substr(0,qryCond.length-2);
  //console.log(qryCond);


  let qry = "SELECT * from " + group + " where ("+qryCond+")";
  //let qry = "SELECT * from " + group + " where " + col[group] + " LIKE '%" + search_val + "%'";

  dbConnect.query(qry,function(err,results,fields){
    if(err)throw err;

    //when several results are fetched
    let resSize = results.length;
    if(resSize==0){
      //no results found
      res.status(200);
      return res.render('noResults',{
        title : 'Not Found - BUDB',
        sv : search_val
      });
    }
    else if(resSize==1){
      //Single result retrieved
      res.status(200);
      return res.render('resultsPage',{
        title:results[0][fields[1].name] + ' - BUDB',
        resName:results[0][fields[1].name],
        group:group,
        result:results[0]
      });
    }
    else{
      //more results retrived
      let retrived = [];
      let searchHit = "";
      for(let i=0;i<resSize;i++){
        searchHit = "";
        for(x in results[i]){
          if(x=="id"){
            continue;
          }
          let searchIndex = results[i][x].indexOf(search_val);
          if (searchIndex>-1){
            searchHit = "..."+ results[i][x].substring(searchIndex-40,searchIndex+search_val.length+40);
          }
        }
        retrived[i] = {
          id : results[i]['id'],
          resName : results[i][fields[1].name],
          matched : searchHit
        }
      }
      res.status(200);
      res.render('multipleResults',{
        title : search_val + ' - BUDB',
        sv : search_val,
        results : retrived,
        resultsSize : resSize,
        group : group
      })
    }    
  })  
});



router.get('/browse/:group',(req,res)=>{
  let group = req.params.group;
  let groupMatch={
    "drug_target": "Drug Target",
    "ethnopharmacological": "Ethnopharmacological Plants",
    "genome": "Genome",
    "test_compounds": "Tested Compounds",
    "existing_drugs": "Existing Drugs"
  }

  let queries = {
    "drug_target": "SELECT id,drug_target,genes,functions,uniport_id,links from " + group,
    "ethnopharmacological": "SELECT id,species,country,part,extraction,links from " + group,
    "genome": "SELECT id,exist_database,mycobacterium,pro_gene_stats,genome_link from " + group,
    "test_compounds": "SELECT id,test_compound,technique,cid,drug_bank_id,reference from " + group,
    "existing_drugs": "SELECT id,drugs,targets,mode,drug_bank_id,reference_links from " + group
  }

  let headers={
    "drug_target": ["Drug Target","Genes","Function","Uniprot ID","Links to Reference Manager"],
    "ethnopharmacological": ["Species","Country of Collection","Part Used","Extraction Method","External Links"],
    "genome": ["Existing Database", "Name of Mycobacterium","Protein and Gene Stats","Genome Link"],
    "test_compounds": ["Tested Compounds","Experimental Technique","PubChem ID","Drug Bank ID","Reference"],
    "existing_drugs": ["Existing Drugs","Drug Target","Mode of Administration","Drug Bank ID","Links to Reference Manager"]
  }
  //let qry = "SELECT * from " + group;

  dbConnect.query(queries[group],function(err,results,fields){
    if(err)throw err;
    //console.log(results);

    let resSize = results.length;
    if(resSize==0){
      //no results found
      res.status(200);
      return res.render('noResults',{
        title : 'Not Found - BUDB',
        sv : search_val
      });
    }
    else{
      //Table retrieved
      res.status(200);
      return res.render('browse',{
        title : groupMatch[group]+' - BUDB',
        group : group,
        groupDisplay: groupMatch[group],
        results : results,
        resultsSize : resSize,
        headers: headers[group]
      });
    }
  });
});

router.get('/faqs',(req,res)=>{
  res.render('faqs',{title:'FAQS'});
});

router.get('/tutorials',(req,res)=>{
  res.render('tutorials',{title: 'Tutorials'});
});

router.get('/contactUs',(req,res)=>{
  res.render('contactUs',{title: 'Contact Us'});
})

module.exports = router;
