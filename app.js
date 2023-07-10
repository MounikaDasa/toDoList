const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');
const day = date.getDate();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const workItems = [];

mongoose.connect("mongodb+srv://dasamounika:yCjqmPBCkPHhx1BK@cluster0.2bvhpxc.mongodb.net/todoListDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: 'Welcome to my To do list' });
const item2 = new Item({ name: "Hit + to add a new item" });
const item3 = new Item({ name: "Click on the checkbox to delete an item" });

const defaultArray = [item1, item2, item3];

const listItem = new mongoose.Schema({
  name: String,
  list: [itemsSchema]
});
const List = mongoose.model("List", listItem);

app.get("/", function (req, res) {
  Item.find().then(function (items) {
    if (items.length === 0) {
      Item.insertMany(defaultArray);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});



app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:mounikaparamId", function (req, res) {
  const listId = _.capitalize(req.params.mounikaparamId);
  List.exists({ name: listId })
    .then(function (exists) {
      if (exists) {
        console.log("exists");
        List.findOne({ name: listId })
          .then(function (list) {
            res.render("list", { listTitle: listId, newListItems: list.list });
          })
          .catch(function (err) {
            console.log(err);
            res.redirect("/");
          });
      } else {
        console.log("does not exist");
        const list = new List({
          name: listId,
          list: defaultArray
        });
        list.save()
          .then(function () {
            res.redirect("/" + listId);
          })
          .catch(function (err) {
            console.log(err);
            res.redirect("/");
          });
      }
    })
    .catch(function (err) {
      console.log(err);
      res.redirect("/");
    });
});



app.post("/", function (req, res) {
  const item = req.body.newItem;
  listName=req.body.list
  if(req.body.list===day){
    const newItem = new Item({ name: item });
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      //console.log(foundList)
      foundList.list.push({ name: item });
    foundList.save()})
    res.redirect("/"+listName);

  }
  
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  listName = req.body.thisListName;
  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Item deleted successfully.");
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
        res.redirect("/");
      });
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.list.pull({ _id: checkedItemId });
        foundList.save()
          .then(function () {
            console.log("Item deleted successfully.");
            res.redirect("/" + listName);
          })
          .catch(function (err) {
            console.log(err);
            res.redirect("/" + listName);
          });
      })
      .catch(function (err) {
        console.log(err);
        res.redirect("/");
      });
  }
});
  


app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000");
});
