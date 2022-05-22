const express = require("express");
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const _ = require("lodash")
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rahul:rahul123@cluster0.rypjx.mongodb.net/todolistDB");

const itemSchema = {
  name: String
}
const Item = mongoose.model('Item', itemSchema)

const item1 = new Item({name : "rahul"})
const item2 = new Item({name : "todays a good days"})
const item3 = new Item({name : "early in the mornng"})

const defaultItem = [item1, item2 , item3]
const listSchema = {
  name: String, 
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema)

app.get("/", function(req, res) {

  Item.find({},(err,foundItem)=>{
    if(foundItem.length === 0){
      Item.insertMany(defaultItem , err=>{
      if(err){
        console.log(err)}
    
      else{
        console.log('successfully')}
      })
      res.redirect('/')
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItem});
    }  
  })

});

app.get('/:customName' , (req, res) => {
  const checkItem= _.capitalize(req.params.customName);

  List.findOne({name: checkItem}, (err, foundList) => {
    if(!err){
      if(!foundList){
        const list = new List({
          name: checkItem,
          items: defaultItem
        })
        list.save()
       res.redirect("/"+ checkItem)
      }else{
        res.render('list', {listTitle: foundList.name, newListItems: foundList.items})
       
      }
    }
  })
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
  name: itemName})

  if(listName === "Today"){
  item.save()
  res.redirect('/')
  }else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect('/'+ listName)
  })
}
});

app.post('/delete', (req,res) => {

  const checkItem =req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItem, function (err) {
      if(!err){
        res.redirect('/')
      }
    })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkItem}}}, (err , foundList)=>{
       if(!err){
         res.redirect('/'+ listName)
       }
    })
  }
 
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
