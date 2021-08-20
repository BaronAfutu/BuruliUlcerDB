var express = require('express');
var dbConnect = require('../bin/db');
var syncSql = require('sync-sql');
var config = require('../bin/dbConfig.json');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Buruli Ulcer Database' });
});




router.get('/any/results',async (req,res)=>{
  let search_val = req.query.search_val;
  var retrivedResults = [];
  let queries = {
    drug_target : "SELECT id,drug_target from drug_target where drug_target LIKE '%" + search_val + "%' ",
    ethnopharmacological : "SELECT id,species from ethnopharmacological where species LIKE '%" + search_val + "%' ",
    genome : "SELECT id,mycobacterium from genome where mycobacterium LIKE '%" + search_val + "%' ",
    test_compounds : "SELECT id,test_compound from test_compounds where test_compound LIKE '%" + search_val + "%' ",
    existing_drugs : "SELECT id,drugs from existing_drugs where drugs LIKE '%" + search_val + "%' "
  };

  for(qry in queries){
    let output = syncSql.mysql(config,queries[qry]);
    let error = output.success==false;
    let results = output.data.rows;
    let fields = output.data.fields;
    
    if(error)res.render('error');
    let resSize = results.length;
    if(resSize>0){
      for( result of results){
        retrivedResults.push({
          id: result['id'],
          resName: result[fields[1].name],
          group: qry
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

//Fetching results
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

  let qry = "SELECT * from " + group + " where " + col[group] + " LIKE '%" + search_val + "%'";

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
      for(let i=0;i<resSize;i++){
        retrived[i] = {
          id : results[i]['id'],
          resName : results[i][fields[1].name]
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

router.get('/contact',(req,res)=>{
  res.render('contact');
})

module.exports = router;
