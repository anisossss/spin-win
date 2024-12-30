var express = require("express")

const app = express()

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/public'));


app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('../index.html');

});



app.listen(5000, function () {
    console.log("Listening on PORT 5000");

});

