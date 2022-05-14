const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const {
  isValidObjectId,
  isValidRequestBody,
  validString,
} = require("../validations/validator");

//


const addReview = async (req, res) => {
  try {


    let data = req.body;
    if(!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Details required to add review to book" });
    let bookId = req.params.bookId;

    if(!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Enter a valid book id" });

    let checkBookId = await bookModel.findById(bookId);
    if(!checkBookId) return res.status(404).send({ status: false, message: "Book not found" });


  if(checkBookId.isDeleted == true) return res.status(404).send({ status: false, message: "Book not found or might have been deleted" })

   
    if(!data.rating) return res.status(400).send({ status: false, message: "Rating is required and should not be 0" });

    if(data.hasOwnProperty('reviewedBy')){
      if(validString(data.reviewedBy)) return res.status(400).send({ status: false, message: "Name should not contain numbers" });
    }
    
    if (validString(data.reviewedBy) || validString(data.review)) {
      return res.status(400).send({ status: false, message: "Enter valid data in review and reviewedBy" })
    }

    if(!validString(data.rating)) return res.status(400).send({ status: false, message: "Rating should be in numbers" });
    if(!((data.rating < 6) && (data.rating > 0))) return res.status(400).send({ status: false, message: "Rating should be between 1 - 5 numbers" });

    data.bookId = bookId;

    let reviewData = await reviewModel.create(data) ;
    await bookModel.findByIdAndUpdate(
      {_id: bookId},
      {$inc: {reviews: 1}}
    )

    res.status(200).send({ status: true, message: "Success", data: reviewData })
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}



//---------------PUT /books/:bookId/review/:reviewId
// PUT /books/:bookId/review/:reviewId | Update the review - review, rating, reviewer's name
const update = async (req, res) => {
  try {

      // get book id
      const bookId = req.params.bookId
      // get review id id
      const reviewId = req.params.reviewId
      // get revirw data from body for updata
      const dataForUpdate = req.body
      // dataForUpdate is valid or not
      if (!isValidRequestBody(dataForUpdate)) return res.status(400).send({
          status: false,
          message: "Body is required!"
      })

      // check book from db ---
      const isBook = await bookModel.findById(bookId).catch(_ => null)
      // check if exist or not
      if (!isBook) return res.status(404).send({
          status: false,
          message: 'Book not found!'
      })

      // check if book is deleted
      if (isBook.isDeleted) return res.status(404).send({
          status: false,
          message: "Book already deleted, can't add review!"
      })


      // check Review from db ---
      const isReview = await reviewModel.findById(reviewId).catch(_ => null)
      // check if exist or not
      if (!isReview) return res.status(404).send({
          status: false,
          message: 'Review not found!'
      })

      // check if Review is deleted
      if (isReview.isDeleted) return res.status(404).send({
          status: false,
          message: "Review already deleted!"
      })

      // destructure body data
      let {
          review,
          rating,
          reviewedBy
      } = dataForUpdate

      // validate review's review, rating, name
      if (!validation.isEmpty(review)) {
          isReview.review = review
      }

      if (!(rating)) {
          // Rating must be in 1 to 5
          if (rating < 1 || rating > 5) return res.status(400).send({
              status: false,
              message: 'Rating must be in 1 to 5!'
          })
          // overwrite rating if ok case
          isReview.rating = rating
      }

      if (!validation.isEmpty(reviewedBy)) {
          isReview.reviewedBy = reviewedBy
      }

      // update review Data by using .save()
      isReview.save()
      res.status(200).send({
          status: true,
          message: isReview
      })

  } catch (e) {
      console.log(e)
      res.status(500).send({
          status: false,
          message: e.message
      })
  }
}




//-------------DELETE_________________-

const deleteReview = async function (req, res) {
  try {
      let bookParams = req.params.bookId;
      let reviewParams = req.params.reviewId

      
      if(!isValidObjectId(bookParams)) return res.status(400).send({status: false, message: "Enter a valid Book id"})
      if(!isValidObjectId(reviewParams)) return res.status(400).send({status: false, message: "Enter a valid Review id"})

      //finding book and checking whether it is deleted or not.
      let searchBook = await bookModel.findById({ _id: bookParams, isDeleted: false })
      if (!searchBook) return res.status(400).send({ status: false, message: `Book does not exist by this ${bookParams}.` })

      //finding review and checking whether it is deleted or not.
      let searchReview = await reviewModel.findById({ _id: reviewParams })
      if (!searchReview) return res.status(400).send({ status: false, message: `Review does not exist by this ${reviewParams}.` })

      //verifying the attribute isDeleted:false or not for both books and reviews documents.
      if (searchBook.isDeleted == false) {
          if (searchReview.isDeleted == false) {
              const deleteReviewDetails = await reviewModel.findOneAndUpdate({ _id: reviewParams }, { isDeleted: true, deletedAt: new Date() }, { new: true })

              if (deleteReviewDetails) {
                  await bookModel.findOneAndUpdate({ _id: bookParams },{$inc:{ reviews: -1 }})
              }
              return res.status(200).send({ status: true, message: "Review deleted successfully."})

          } else {
              return res.status(400).send({ status: false, message: "Unable to delete review details Review has been already deleted" })
          }
      } else {
          return res.status(400).send({ status: false, message: "Unable to delete Book has been already deleted" })
      }
  } catch (err) {
      return res.status(500).send({ status: false, Error: err.message })
  }
}
// const deleteReview = async function (req, res) {
//   try {
//       let bookId = req.params.bookId
//       let reviewId = req.params.reviewId

//       if (!isValidObjectId(bookId)) {
//           return res.status(400).send({ status: false, msg: "pls enter valid bookId in path param" })
//       }

//       if (!isValidObjectId(reviewId)) {
//           return res.status(400).send({ status: false, msg: "enter the valid reviewId in path parameter " })
//       }
//       let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
//       if (book) {

//           let isReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
//           if (isReview) {
//               let deleteInReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { isDeleted: true })
//               let updateInBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } })
//               res.status(200).send("completed the task")
//           } else {
//               res.status(404).send({ msg: "No Review data are found" })

//           }
//       } else {
//           res.status(404).send({ msg: "No Book found" })
//       }
//   } catch (err) {
//       console.log(err)
//       res.status(500).send({ msg: err.message })
//   }
// }
module.exports = { addReview,deleteReview };
