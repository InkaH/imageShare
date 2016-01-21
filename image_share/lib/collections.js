Images = new Mongo.Collection("images");

//secure Images collection
Images.allow({
	insert:function(userId, doc){
		if(Meteor.user()){ //only for logged in users
			//inserted image's createdby value must match the user's id
			if(userId != doc.createdBy){
				return false;
			}
			else{
				return true;
			}
		}
		else{ //user is not logged in
			return false;
		}
	}, 
	remove:function(userId, doc){
		return true;
	}

})

