import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiHotel, BiMoney, BiStar } from "react-icons/bi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MyHotels = () => {
  const { data: hotelData } = useQuery("fetchMyHotels", apiClient.fetchMyHotels);

  if (!hotelData || hotelData.length === 0) {
    return (
      <div className="page-container">
        <p className="text-gray-500 text-center">No Hotels found</p>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  return (
    <div className="page-container max-w-6xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Hotels</h1>
        <Link
          to="/add-hotel"
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-500"
        >
          Add Hotel
        </Link>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hotelData.map((hotel) => (
          <div
            key={hotel._id}
            className="border border-slate-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Image Carousel */}
            {hotel.imageUrls?.length ? (
              <Slider {...sliderSettings} className="h-56 md:h-64">
                {hotel.imageUrls.map((img, idx) => (
                  <div key={idx} className="h-56 md:h-64 w-full overflow-hidden">
                    <img
                      src={img}
                      alt={`${hotel.name} ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="h-56 md:h-64 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">{hotel.name}</h2>
              <p className="text-gray-600 whitespace-pre-line">{hotel.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="badge flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <BsMap /> {hotel.city}, {hotel.country}
                </div>
                <div className="badge flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <BsBuilding /> {hotel.type}
                </div>
                <div className="badge flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <BiMoney /> £{hotel.pricePerNight} / night
                </div>
                <div className="badge flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <BiHotel /> {hotel.adultCount} adults, {hotel.childCount} children
                </div>
                <div className="badge flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <BiStar /> {hotel.starRating} Star
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to={`/edit-hotel/${hotel._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-500"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHotels;
