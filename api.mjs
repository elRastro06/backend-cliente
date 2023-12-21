import axios from "axios";
const urlReviews = process.env.REVIEWS_URL;


export const getReviewsByReviewedID = async (id) => {
  const response = await axios.get(`${urlReviews}/v2/?reviewedID=${id}`);
  return response.data;
};