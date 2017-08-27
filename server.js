var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');

var config = {
     user:  'rockstar1538',
     database: 'rockstar1538',
     host: 'db.imad.hasura-app.io',
     port: '5432',
     password: process.env.DB_PASSWORD
};
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

var articles = {
    'article-one': {
    title: 'introduction',
    heading: 'Introduction: Amit Raj',
    date: '25 Aug,2017',
    content: `
            <p>First Time I am going to develop an App that will help people to reach the another side of world.
            </p>
            <p>
                THANK YOU.
            </p>
            <p>
                KEEP SUPPORTING.
            </p>`
    },
    'article-two':{ 
    title: 'status-of-app',
    heading: 'Introduction: The Webapp',
    date: '25 Aug,2017',
    content: `
            <p>App is going to launch soon. Coding is going on.
            </p>
            <p>
                THANK YOU.
            </p>
            <p>
                KEEP SUPPORTING.
            </p>`
},
    'article-three':{ 
    title: 'about-the-Webapp',
    heading: 'About: The Webapp:',
    date: '25 Aug,2017',
    content: `
            <p>Start of a new begining. Coding a webapp to serve the customers.
            </p>
            <p>
                THANK YOU.
            </p>
            <p>
                KEEP SUPPORTING.
            </p>`
}
    };

 function createTemplate (data) {
     var title=data.title;
     var date=data.date;
     var heading=data.heading;
     var content=data.content;
     
 var htmlTemplate = `
 <html>
    <head>
        <title>
           ${title}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/ui/style.css" rel="stylesheet" />
        </head>
    <body>
        <div class="container">
        <div>
            <a href="/">Home</a>
        </div>
        <hr/>
        <h3>
            ${heading}
        </h3>
        <div>
            ${date.toDateString()}
        </div>
        <div>
           ${content}
        </div>
        </div>
    </body>
</html>

`;
return htmlTemplate;

     
 }
 
 function hash (input, salt){
   //How do we create a Hash?
   var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
   return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
   
   // algorithm md5
   // "password" -> fg21dfv15d5f4v4dv5dv45d4f5v45vd4dfv4
   // "password-this-is-some-random-string" -> fd4bd5fdg48dsf4d4d8f789vd8df4v8df4v7v8v87v8f48dfv48df
   // "password"-> "password-this-is-some-random-string"-> <hash> -> <hash> x 100
    }
    
 
 app.get('/hash/:input', function(req, res){
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
     
 });
 
 app.post('/create-user', function (req, res){
    // username, password
    // JSON
    var username= req.body.username;
    var password= req.body.password;
    var salt = crypto.getRandomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result)  {
          if(err) {
            res.status(500).send(err.toString());
        }
        else{
            res.send('user sucessfully created', +username);
        }
    });
     
 });

    var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    
    // make a select request
    // return a response with the result
    pool.query('SELECT * FROM test', function(err, result) {
        if(err) {
            res.status(500).send(err.toString());
        }
        else{
            res.send(JSON.stringify(result.rows));
        }
    });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
  var counter = 0;
app.get('/counter', function(req, res) {
    counter = counter + 1;
    res.send(counter.toString());
});

 var names = [];
app.get('/submit-name', function(req, res) {
    //get name from the request
  var  name = req.query.name;
  
  names.push(name);
  // JSON java script object notation
  res.send(JSON.stringify(names)); 
});

app.get('/articles/:articleName', function (req, res) {
   //articleName==article-one
   //article[articleName]== content object of article one
   
   // SELECT * FROM articles WHERE title = 'article-one'
  pool.query("SELECT * FROM articles WHERE title = $1",[req.params.articleName], function (err, result) {
     if(err) {
         res.status(500).send(err.toString());
     } 
     else {
         if(result.rows.length === 0) {
             res.status(404).send('Article Not Found');
         }
         else {
             var articleData = result.rows[0];
              res.send(createTemplate(articleData)); 
         }
     }
  });
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
