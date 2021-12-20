var express = require('express');
var dbConnect = require('../config/db');
var syncSql = require('sync-sql');
var config = require('../config/dbConfig.json');
const {body,query,param,validationResult} = require('express-validator');

var router = express.Router();
//require('dotenv').config({ path: './.env' }); //Is present in db.js as well

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



router.use(
  '/any/results',
  query('search_val','Minimum search text length: 2').trim().isLength({min:3}).escape(),
  (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    //console.error(errors);
    res.render('error',{'title':'Error','errMsg':errors.errors[0].msg});
  }
  else{
    next();
  }
});//Input validation
router.get('/any/results',async (req,res)=>{
  let search_val = req.query.search_val;
  var retrivedResults = [];

  // getting table fields. 
  // Changes to the DB fields will not affect the code unless table names are changed
  let results = [];
  let qryCond = "";
  let qryConds = [];
  //let tableNames = ["drug_target","ethnopharmacological","existing_drugs","genome","test_compounds"];
  let fieldNames = [];
  let tempFNarray = [];

  try {
    results.push(syncSql.mysql(config,"SELECT * from drug_target LIMIT 1").data.fields);
    results.push(syncSql.mysql(config,"SELECT * from ethnopharmacological LIMIT 1").data.fields);
    results.push(syncSql.mysql(config,"SELECT * from existing_drugs LIMIT 1").data.fields);
    results.push(syncSql.mysql(config,"SELECT * from genome LIMIT 1").data.fields);
    results.push(syncSql.mysql(config,"SELECT * from test_compounds LIMIT 1").data.fields);
  } catch (error) {
    console.error(error);
    return res.render('error',{'title':'Error','errMsg':'Error encountered while performing the search.'});
  }

  //creating the search queries
  for(let table of results){
    qryCond = "";
    tempFNarray = ['id'];
    for(let fields of table){
      if(fields.type==3)continue; //will exclude fields of type int from the search
      qryCond+=" "+fields.name+" LIKE '%"+search_val+"%' OR";
      tempFNarray.push(fields.name);
    }
    qryConds.push(qryCond.substring(0,qryCond.length-2));
    fieldNames.push(tempFNarray);
  }


  let queries = {
    drug_target : `SELECT * from drug_target where (${qryConds[0]})`,
    ethnopharmacological : `SELECT * from ethnopharmacological where (${qryConds[1]})`,
    existing_drugs : `SELECT * from existing_drugs where (${qryConds[2]})`,
    genome : `SELECT * from genome where (${qryConds[3]})`,
    test_compounds : `SELECT * from test_compounds where (${qryConds[4]})`
  };

  for(qry in queries){
    let output = [];
    try {
      output = syncSql.mysql(config,queries[qry]);
    } catch (error) {
      console.error(error);
      return res.render('error',{'title':'Error','errMsg':'Error encountered while performing the search.'});
    }
    let error = output.success==false;
    //console.log(output.data.rows);
    let results = output.data.rows;
    let fields = output.data.fields;
    //return res.json({});
    if(error){
      console.error(error);
      return res.render('error',{'title':'Error','errMsg':'Error encountered while performing the search.'});
    }
      let resSize = results.length;

    if(resSize>0){

      let searchHit = "";   //Getting matched results
      for(let i=0;i<resSize;i++){
        searchHit = "";
        for(x in results[i]){
          if( !isNaN(parseInt(results[i][x])) || results[i][x]==null){//if the field is a number
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

/*
router.use('/addEntry/:group',
params('group','404 - Page not found!!').isIn(["drug_target","ethnopharmacological","existing_drugs","genome","test_compounds"]),
  (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.error(error);
    return res.render('error',{'title':'Error','errMsg':'Error encountered while performing the search.'});
  }
  else{
    next();
  }
});//Input validation
router.post('/addEntry/:group', (req,res)=>{//should go to admin section
  //console.log(req.params.group)
  if(!req.params.group){return res.render('error',{title: "Error Page"})}
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
});
*/

router.use('/results/:group/:id',
  param('group','404 - Page not found!!').isIn(["drug_target","ethnopharmacological","existing_drugs","genome","test_compounds"]),
  param('id').isNumeric().trim().escape(),
  (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.error(errors);
    return res.render('error',{'title':'Error','errMsg':errors.errors[0].msg});
  }
  else{
    next();
  }
});//Input validation
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

router.use('/results',
  query('group','404 - Page not found!!').isIn(["drug_target","ethnopharmacological","existing_drugs","genome","test_compounds"]),
  query('search_val','Minimum search text length: 2').trim().isLength({min:3}).escape(),
  (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.error(errors);
    return res.render('error',{'title':'Error','errMsg':errors.errors[0].msg});
  }
  else{
    next();
  }
});//Input validation
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

  if(error)return res.render('error');
  for(x in results[0]){
    qryCond+=" "+x+" LIKE '%"+search_val+"%' OR";
  }
  qryCond = qryCond.substring(0,qryCond.length-2);
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
          if( !isNaN(parseInt(results[i][x])) || results[i][x]==null){//if the field is a number
            continue;
          }
          let searchIndex = results[i][x].indexOf(search_val);
          if (searchIndex>-1){
            searchHit = "..."+ results[i][x].substring(searchIndex-40,searchIndex+search_val.length+40);
          }
        }
        if(searchHit=="")searchHit="found within detailed information";

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


router.use('/browse/:group',
  param('group','404 - Page not found!!').isIn(["drug_target","ethnopharmacological","existing_drugs","genome","test_compounds"]),
  (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.error(errors);
    return res.render('error',{'title':'Error','errMsg':errors.errors[0].msg});
  }
  else{
    next();
  }
});//Input validation
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
    "drug_target": "SELECT id,drug_target,organism,gene_name,amp,function from " + group,
    "ethnopharmacological": "SELECT id,species,family,country,part,metabolites from " + group,
    "genome": "SELECT id,organism_name,organism_grp,subspecies_name,pro_coding,taxonomy from " + group,
    "test_compounds": "SELECT id,test_compound,mic,experimental,structure_2d,cid from " + group,
    "existing_drugs": "SELECT id,drugs,class,target,mechanism,mode from " + group
  }

  let headers={
    "drug_target": ["Potential Drug Target","Organism","Gene Name","Associated Metabolic Pathways","Function"],
    "ethnopharmacological": ["Species","Family","Country of Collection","Part Used","Secondary Metabolites/Photochemical Composition"],
    "genome": ["Organism Name", "Organism Group","Sub-species Class. Strain Name","CDS","Taxonomy"],
    "test_compounds": ["Tested Compounds","MIC","Experimental Technique","2D structure","PubChem CID"],
    "existing_drugs": ["Experimental Drugs","Class","Target Protein","Mechanism of Action","Mode of Administration"]
  }
  //let qry = "SELECT * from " + group;

  dbConnect.query(queries[group],function(err,results,fields){
    if(err)throw err;

    let resSize = results.length;

    res.status(200);
    return res.render('browse',{
      title : groupMatch[group]+' - BUDB',
      group : group,
      groupDisplay: groupMatch[group],
      results : results,
      resultsSize : resSize,
      headers: headers[group]
    });
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
