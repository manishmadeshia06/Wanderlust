const Listing = require("./models/listing");
const {listingSchema,reviewSchema} = require("./schema");
const ExpressError = require("./utils/ExpressError");


module.exports.isLoggedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing");
         return res.redirect("/login");
    }
    next();
} 

module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}



module.exports.isOwner = async (req, res, next) => {
    try {
        let { id } = req.params;
        // Trim the ID to remove any trailing whitespace
        id = id.trim();
        
        let listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect(`/listings`);
        }

        if (!listing.owner._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }

        next();
    } catch (error) {
        console.error("Error in isOwner middleware:", error);
        req.flash("error", "An error occurred");
        res.redirect(`/listings`);
    }
};



//validate listing
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
};
