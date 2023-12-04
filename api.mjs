import axios from "axios";
const urlReviews = "http://localhost:5008/v2"


export const getReviewsByReviewedID = async (id) => {
  const response = await axios.get(`${urlReviews}/?eviewedID=${id}`);
  return response.data;
};