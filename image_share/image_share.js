Images = new Mongo.Collection("images");
console.log(Images.find().count());

if (Meteor.isClient) {
/*  var img_data = [
  {
    img_src:"rikkerakke.jpg",
    img_alt:"Pop Art Doggies"
  },
  {
    img_src:"leaffrog.jpg",
    img_alt:"Leaf Frog"
  },
  {
    img_src:"python-java.PNG",
    img_alt:"Coder Cartoon"
  },

  ];
  bind the data to the template with a template helper method
  Template.images.helpers({images:img_data});*/
  /*Example if there's load order problem: force the images template to subscribe to the collection when it is created, 
  and then force it to query the Collection when it is rendered. If the Collection 
  isn't finished with its initialization operations (inserting), then it won't respond 
  until it is, which the subscribe picks up on and then continues rendering the images 
  template (which contains the starsRating template, which needs a document id from the Collection).
  Template.images.onCreated(function(){
    this.subscribe("images");
  });

  Template.images.onRendered(function(){
    console.log(Images.find().fetch());
  });*/

  //set limit to how many images we query from the db at one time 
  Session.set("imageLimit", 8);

  lastScrollTop = 0;
  //listen to scroll event to load more images when the user scrolls down
  $(window).scroll(function(event){
    //check if we're near the bottom of the window
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
      //check where we are in the page
      var scrollTop = $(this).scrollTop();
      //check if we're going down
      if(scrollTop > lastScrollTop){
        //we're heading down so show more images
        Session.set("imageLimit", Session.get("imageLimit") + 4);
      }

      lastScrollTop = scrollTop;
    }
  });
  
  //configure the behaviour of {{>loginButtons}} by adding some fields
  //to the signup form
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });

  Template.images.helpers({

    //get the images from db in the order of rating (-1 means desc order) 
    images:function(){
      if(Session.get("userFilter")){//check if a filter is set
        return Images.find({createdBy:Session.get("userFilter")}, {sort:{createdOn: -1, rating: -1}, limit:Session.get("imageLimit")});
      }
      else {
        //if there's no filter get all the images in db
        return Images.find({}, {sort:{createdOn: -1, rating: -1}, limit:Session.get("imageLimit")});
      }
    },

    //check if images are being filtered to offer filter removal for the user
    filtering_images:function(){
      if(Session.get("userFilter")){//check if a filter is set
        return true;
      }
      else {
        return false;
      }
    },

    //get username whose images are being filtered
    getFilterUser:function(){
      if(Session.get("userFilter")){//check if a filter is set
        var user = Meteor.users.findOne({_id:Session.get("userFilter")});
        return user.username;
      }
      else {
        return false;
      }
    },
    
    //get username by id
    getUser:function(user_id){
      var user = Meteor.users.findOne({_id:user_id});
      if(user){
        return user.username;
      }
      else {
        return "anonymous";
      }
    }
  });

  //helper function to get the username so we can show it in the greeting
  Template.body.helpers({username:function(){
    if (Meteor.user()){
      return Meteor.user().username;
    }
    else {
      return "anonymous";
    }
  }
  });

  //bind the event listener to the template - all elements in this template that have the class "js-image"
  // will have a listener that listens to clicks and executes the function after it
  Template.images.events({
    //event listener for clicking on an image
    'click .js-image':function(event){
    $(event.target).css("width", "50px");
    },

    //event listener for Delete button
    'click .js-del-image':function(event){
      var image_id = this._id;
      console.log(image_id);
      //let's hide the image component with jQuery first to make the deletion event slower
      //then remove the image at the end of the animation
      $("#"+image_id).hide('slow', function(){
        //Mongo filter - anything that matches this id in the collection
        Images.remove({"_id":image_id});
      })  
    },

    //event listener for star rating 
    'click .js-rate-image':function(event){
      //get the rating
      var rating = $(event.currentTarget).data("userrating");
      console.log(rating);
      //get the image id
      var image_id = this.id;
      console.log(image_id);
      //update the rating
      Images.update({_id:image_id}, {$set: {rating:rating}});
    },

    //event listener for the Add Image button
    'click .js-show-image-form':function(event){
      $("#image_add_form").modal('show');
    },

    //event listener for clicking on an username of an image
    //we want to trigger a re-render of the images that contains
    //only the images of the clicked username
    'click .js-set-image-filter':function(event){
      //'this' is the data context for the template in which the event occured
      Session.set("userFilter", this.createdBy);
    },

    //event listener for clicking the remove filter link
    'click .js-unset-image-filter':function(event){
      Session.set("userFilter", undefined);
    }
  });

  //event listener for Save button in the add image form
  Template.image_add_form.events({
    'submit .js-add-image':function(event){
      var img_src, img_alt;
      img_src = event.target.img_src.value;
      img_alt = event.target.img_alt.value;
      //check it works
      console.log("src: " + img_src + " alt: " + img_alt);
      //only add images to the db if user is logged in
      if(Meteor.user()){
        Images.insert({
        img_src:img_src,
        img_alt:img_alt,
        createdOn:new Date(),
        createdBy:Meteor.user()._id
        });
      } 
      //dismiss the modal after adding image
      $("#image_add_form").modal('hide');
      //return false from event handlers to stop the default browser action so 
      //we can see the console log
      return false;
    }
  });
}

