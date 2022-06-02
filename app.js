require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admit-rajat:Test123@cluster0.uzkn9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true });

const itemSchema = {
    name: String,
    userid: String
};

const Item = mongoose.model("Item", itemSchema);

var imageSchema = new mongoose.Schema({
    userid: String,
    name: String,
    desc: String,
    img:
    {
        type: String
    }
});

const image = mongoose.model('Image', imageSchema);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        // let ext = path.extname(file.originalname)
        cb(null, Date.now() + file.originalname)
    }
});

// upload parameters for multer

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3
    }
});

const TransactionSchema = new mongoose.Schema({

    flow: {
        type: String
    },

    userid: {
        type: String
    },
    amount: {
        type: Number,
        required: [true, 'Please add a number']
    },
    category: {
        type: String,
        required: [true, 'Please select one of these category']
    },
    mode: {
        type: String,
        required: [true, 'Please select one of these category']
    },
    note: {
        type: String,
        trim: true,
        required: [true, 'Please add some text']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    year: {
        type: String
    },
    month: {
        type: String
    },
});
const transactions = mongoose.model('Transaction', TransactionSchema);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    balance: Number,
    totalCredit: Number,
    totalDebit: Number,
    xsavings: {
        type: Number,
        default: 0
    },
    xincome: {
        type: Number,
        default: 0
    },
    xgrocery: {
        type: Number,
        default: 0
    },
    xtranspartation: {
        type: Number,
        default: 0
    },
    xeducation: {
        type: Number,
        default: 0
    },
    xother: {
        type: Number,
        default: 0
    },
    xexpense: {
        type: Number,
        default: 0
    }
});


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.get("/tracker", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("tracker", { User: req.user });
    }
    else {
        res.redirect("login");
    }
});

app.get("/income", function (req, res) {

    if (req.isAuthenticated()) {
        res.render("income", { User: req.user });
    }
    else {
        res.redirect("login");
    }
});

app.get("/charts", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("charts", { User: req.user })
    }
    else {
        res.redirect("login");
    }
});

app.get("/history", function (req, res) {
    if (req.isAuthenticated()) {
        transactions.find()
            .exec()
            .then(results => res.render("history", { transactions: results, User: req.user }))
            .catch(err => res.redirect("tracker"));

    }
    else {
        res.redirect("login");
    }
});

app.get("/target", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("target", { User: req.user });
    }
    else {
        res.redirect("login");
    }
});

app.get('/uploadRecipts', (req, res) => {


    if (req.isAuthenticated()) {
        image.find()
            .exec()
            .then(items => res.render("uploadRecipts", { items: items, User: req.user }))
            .catch(err => res.redirect("tracker"));

    }
    else {
        res.redirect("login");
    }
});

// list****************************************************

app.get("/list", (req, res) => {
    if (req.isAuthenticated()) {
        Item.find({}, function (err, foundItems) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("list", { listTitle: "Today", newListItems: foundItems, User: req.user });
            }

        });
    }
    else {
        res.redirect("login");
    }
});

app.post("/newlist", function (req, res) {
    let itemName = req.body.newItem;
    const newItem = new Item({
        name: itemName,
        userid: req.user._id
    });

    newItem.save();
    res.redirect("/list");

});

app.post("/list", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/list");
        }
    });
});

// list******************************************

app.post("/tracker", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.post("/income", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.post("/charts", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.post("/history", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.post("/target", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.post("/uploadRecipts", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/signup", function (req, res) {

    User.register({ username: req.body.username, balance: 0, totalCredit: 0, totalDebit: 0 }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("login");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("tracker");
            });
        }
    });

});


app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            res.redirect("signup");
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("tracker");
            });
        }
    });

});


app.post("/addMoney", function (req, res) {

    const transaction = new transactions({
        flow: "Credit",
        userid: req.user.id,
        amount: req.body.income,
        category: req.body.category,
        mode: req.body.mode,
        note: req.body.note,
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    transaction.save();

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { balance: req.body.income } }, function (err, data) {
        if (err) {
            console.log(err);
            req.redirect("income");
        }
        else {
            console.log(data);
        }
    });

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { totalCredit: req.body.income } }, function (err, data) {
        if (err) {
            console.log(err);
            req.redirect("income");
        }
        else {
            console.log(data);
        }
    });

    res.redirect("income");
});
app.post("/subMoney", function (req, res) {

    const transaction = new transactions({
        flow: "Debit",
        userid: req.user.id,
        amount: req.body.expense,
        category: req.body.category,
        mode: req.body.mode,
        note: req.body.note,
        year: new Date().getFullYear(),
        month: new Date().getMonth()
    });

    transaction.save();

    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { balance: -req.body.expense } }, function (err, data) {
        if (err) {
            console.log(err);
            req.redirect("income");
        }
        else {
            console.log(data);
        }
    });
    User.findOneAndUpdate({ _id: req.user._id }, { $inc: { totalDebit: req.body.expense } }, function (err, data) {
        if (err) {
            console.log(err);
            res.redirect("income");
        }
        else {
            console.log(data);
        }
    });
    res.redirect("income");

});

app.post("/setTarget", function (req, res) {
    let expectedExpense = Number(req.body.TGroceryExpense) + Number(req.body.TTransportationExpense) + Number(req.body.TEducationExpense) + Number(req.body.TOtherExpense);
    let TSavings = Number(req.body.ProjectedIncome) - Number(req.body.TGroceryExpense) - Number(req.body.TTransportationExpense) - Number(req.body.TEducationExpense) - Number(req.body.TOtherExpense);
    User.findOneAndUpdate({ _id: req.user._id }, { xincome: req.body.ProjectedIncome, xgrocery: req.body.TGroceryExpense, xtranspartation: req.body.TTransportationExpense, xeducation: req.body.TEducationExpense, xother: req.body.TOtherExpense, xsavings: TSavings, xexpense: expectedExpense }, function (err, data) {

        if (err) {
            console.log(err);
            res.redirect("target");
        }
        else {
            res.redirect("target");
        }
    });
});


app.post('/addnewRecipts', upload.single('image'), async (req, res) => {

    console.log(req.file);
    let obj = new image({
        userid: req.user._id,
        name: req.body.imgtitle,
        desc: req.body.desc,
        img: req.file.filename
    });

    try {
        obj = await obj.save();
        res.redirect('uploadRecipts');
    } catch (error) {
        console.log(error);
    }

});

let port = process.env.PORT;

if (port == null || port == ""){
    port = 3000;
}
app.listen(port, function () {
    console.log("Server has started successfully");
});
