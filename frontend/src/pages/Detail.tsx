import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "./../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";

const Detail = () => {
  const { hotelId } = useParams();

  const { data: hotel } = useQuery(
    ["fetchHotelById", hotelId],
    () => apiClient.fetchHotelById(hotelId || ""),
    { enabled: !!hotelId }
  );

  if (!hotel) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <div className="flex mt-1">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <AiFillStar key={i} className="text-yellow-400 text-xl" />
            ))}
          </div>
        </div>
        <div className="text-2xl font-semibold text-blue-600">
          £{hotel.pricePerNight.toFixed(2)}{" "}
          <span className="text-sm text-gray-500">/ night</span>
        </div>
      </div>

      {/* HERO IMAGE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main image */}
        <div className="overflow-hidden rounded-xl w-full md:col-span-2">
          {hotel.imageUrls[0] ? (
            <img
              src={hotel.imageUrls[0]}
              alt={hotel.name}
              className="w-full h-full object-contain rounded-xl bg-gray-100"
            />
          ) : (
            <div className="h-96 bg-gray-200 flex items-center justify-center rounded-xl">
              No Image
            </div>
          )}
        </div>

        {/* Secondary images */}
        <div className="grid grid-rows-2 gap-4">
          {hotel.imageUrls.slice(1, 3).map((img, i) => (
            <div key={i} className="overflow-hidden rounded-xl w-full">
              <img
                src={img}
                alt={`${hotel.name} ${i + 2}`}
                className="w-full h-full object-contain rounded-xl bg-gray-100"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT + BOOKING */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">

        {/* LEFT CONTENT */}
        <div className="space-y-6">
          {/* Description */}
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {hotel.description}
          </p>

          {/* Facilities */}
<div className="space-y-4">
  <h2 className="text-2xl font-semibold mb-2">Facilities</h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {hotel.facilities.map((facility, idx) => (
      <div
        key={idx}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition cursor-default"
      >
        {/* Optional: add icons */}
        {/* <FacilityIcon name={facility} /> */}
        <span className="text-sm font-medium text-gray-700">{facility}</span>
      </div>
    ))}
  </div>
</div>

{/* Facilities
      <div>
        <h2 className="text-2xl font-semibold mb-2">Facilities</h2>
        <div className="flex flex-wrap gap-2">
          {hotel.facilities.map((facility, idx) => (
            <span
              key={idx}
              className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium"
            >
              {facility}
            </span>
          ))}
        </div>
      </div> */}
      
        </div>

        {/* RIGHT – STICKY BOOKING */}
        <div className="sticky top-24 h-fit bg-white border rounded-xl shadow-md p-6">
          <GuestInfoForm
            pricePerNight={hotel.pricePerNight}
            hotelId={hotel._id}
          />
        </div>
      </div>

      {/* ADDITIONAL IMAGE GALLERY */}
      {hotel.imageUrls.length > 3 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">More Photos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {hotel.imageUrls.slice(3).map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-xl h-64">
                <img
                  src={img}
                  alt={`${hotel.name} additional ${idx + 4}`}
                  className="w-full h-full object-contain rounded-xl bg-gray-100"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;

