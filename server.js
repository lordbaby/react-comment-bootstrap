var express=require('express'),
	fs=require('fs'),
	path=require('path'),
	bodyParser=require('body-parser'),
	app=express();

var COMMENTS_FILE = path.join(__dirname+'/public/', 'comments.json');
var PRODUCTS_FILE=path.join(__dirname+'/public/', 'products.json');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', (process.env.PORT || 3000));



// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/comments', function(req, res) {
  fs.readFile(COMMENTS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/comments', function(req, res) {
  fs.readFile(COMMENTS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var comments = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    var newComment = {
      id: Date.now(),
      author: req.body.author,
      text: req.body.text,
    };
    console.log(req.body);
    comments.push(newComment);
    fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(comments);
    });
  });
});

app.get('/api/products',function(req,res){
  fs.readFile(PRODUCTS_FILE,function(err,data){
    if(err){
      console.error(err);
      process.exit(1);
    }
    var products=JSON.parse(data),
        newProducts=[];
    var text=req.query.text;
    console.log(text);
    if(text&&text.trim()!==""){
      for(var i=0;i<products.length;i++){
        var product=products[i];
        if(product.name.indexOf(text)!==-1){
          newProducts.push(product);
        }
      }
    }else{
      newProducts=products;
    }
    res.json(newProducts);
  });
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});