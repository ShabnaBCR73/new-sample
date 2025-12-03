let express= require('express');
let session = require('express-session');
let bodyParser = require('body-parser');

const path = require('path');


let app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname, 'views'))
app.use(express.json())

app.use(session({
    secret: 'secret-key',
    resave:false,
    saveUninitialized: true
    
}));

const USER = {username: 'admin' , password: '54321'};

app.get('/' , (req,res) => {
    if(req.session.loggedIn){
        return res.redirect('/home')
    }
    res.render('login' , {error: null});
});

app.post('/login', (req, res) => {
    const {username , password} = req.body;

    if(username === USER.username && password === USER.password){
        req.session.loggedIn = true;
        req.session.username = username
        return res.redirect('/home');
    }else{
        res.render('login', {error:'Incorrect username or password'})
    }

});


app.get('/home' ,(req,res) => {
    if(req.session.loggedIn){
        res.render('home', {username:req.session.username});


    }else{
        res.redirect('/')
    }
    
});

app.get('/logout', (req,res) => {
    req.session.destroy(err => {
        if(err){
            return res.status(500).send('error signing out')
        }else{
            res.redirect('/')
        }
    })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {console.log(`Server started on port ${PORT}`);
});


let users = [];

app.post('/create-user' , (req,res) => {
    try{
        const {username , password} = req.body;
        
        if(!username || !password){
            return res.status(400).json({error: 'all fields are required'})
        }
        
        const exists = users.find(u => u.username === username);
        
        if(exists){
            return res.status(409).json({error: 'user already exists'})
        }
        
        const newUser = {username , password};
        users.push(newUser);
        
        res.json({message: 'user created successfully',user: newUser});
    
    }catch(error){
        console.log(error);
        res.status(500).json({error: 'internal server error'})

    }

});


