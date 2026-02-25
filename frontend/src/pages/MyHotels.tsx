import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiHotel, BiMoney, BiStar } from "react-icons/bi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MyHotels = () => {
  const queryClient = useQueryClient();

  const { data: hotelData, isLoading } = useQuery(
    "fetchMyHotels",
    apiClient.fetchMyHotels
  );

  const deleteMutation = useMutation(apiClient.deleteMyHotel, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchMyHotels");
    },
  });

  if (isLoading) return <p>Loading...</p>;

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Hotels</h1>
        <Link
          to="/add-hotel"
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-500"
        >
          Add Hotel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hotelData.map((hotel: any) => (
          <div
            key={hotel._id}
            className="border rounded-lg shadow-sm overflow-hidden"
          >
            {hotel.imageUrls?.length ? (
              <Slider {...sliderSettings}>
                {hotel.imageUrls.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    className="w-full h-64 object-cover"
                  />
                ))}
              </Slider>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-200">
                No Image
              </div>
            )}

            <div className="p-4 space-y-3">
              <h2 className="text-xl font-bold">{hotel.name}</h2>

              <div className="flex gap-3 flex-wrap text-sm">
                <span className="flex items-center gap-1">
                  <BsMap /> {hotel.city}, {hotel.country}
                </span>

                <span className="flex items-center gap-1">
                  <BsBuilding /> {hotel.type}
                </span>

                <span className="flex items-center gap-1">
                  <BiMoney /> £{hotel.pricePerNight}
                </span>

                <span className="flex items-center gap-1">
                  <BiHotel /> {hotel.adultCount} adults, {hotel.childCount} children
                </span>

                <span className="flex items-center gap-1">
                  <BiStar /> {hotel.starRating} star
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Link
                  to={`/edit-hotel/${hotel._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-500"
                >
                  Edit
                </Link>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this hotel?"
                      )
                    ) {
                      deleteMutation.mutate(hotel._id);
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHotels;