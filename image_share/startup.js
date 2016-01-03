if (Meteor.isServer){
	Meteor.startup(function(){
		//let's load our demo images if there are none in the db
		if (Images.find().count() == 0){
			for (var i=1; i<=18; i++){
				Images.insert(
					{
	    			img_src:"img_"+i+".jpg",
	    			img_alt:"image number"+i
					}
				);
			}//end of for insert images
		}//end of if no images
	});
}