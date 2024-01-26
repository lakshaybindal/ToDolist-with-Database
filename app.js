const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
let items = [];
let works = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
mongoose.connect(
  "mongodb://127.0.0.1:27017/todolistDB"
);

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcom to your ToDo list",
});
const item2 = new Item({
  name: "Hit the + button to add",
});
const item3 = new Item({
  name: "<-- hit this button to delete item",
});

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.use(express.static("public"));
app.get("/", (req, res) => {
  Item.find().then((founditems) => {
    if (founditems.length === 0) {
      Item.insertMany([item1, item2, item3]);
    }
    res.render("list", { title: "Today", newItems: founditems });
  });
});

app.get("/:title", (req, res) => {
  const customListName = _.capitalize(req.params.title);
  List.findOne({ name: customListName }).then((foundlist) => {
    if (!foundlist) {
      const list = new List({
        name: customListName,
        items: [item1, item2, item3],
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { title: foundlist.name, newItems: foundlist.items });
    }
  });
});

app.post("/", (req, res) => {
  const Newitem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: Newitem,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundlist) => {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedID = req.body.checkBox;
  const checkList = req.body.listName;
  if (checkList === "Today") {
    Item.findByIdAndDelete(checkedID).then(function (res) {
      console.log("success");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: checkList },
      { $pull: { items: { _id: checkedID } } }
    ).then(() => {
      res.redirect("/" + checkList);
    });
  }
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {});
