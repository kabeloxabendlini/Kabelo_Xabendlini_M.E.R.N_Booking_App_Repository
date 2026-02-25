import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Elements } from "@stripe/react-stripe-js";

import BookingForm from "../forms/BookingForm/BookingForm";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { useSearchContext } from "../contexts/SearchContext";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";

const Booking = () => {
  const { stripePromise } = useAppContext();
  const search = useSearchContext();
  const { hotelId } = useParams<{ hotelId: string }>();

  const [numberOfNights, setNumberOfNights] = useState<number>(0);

  useEffect(() => {
    if (search.checkIn && search.checkOut) {
      const nights =
        Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) /
        (1000 * 60 * 60 * 24);

      setNumberOfNights(Math.ceil(nights));
    }
  }, [search.checkIn, search.checkOut]);

  const { data: hotel } = useQuery(
    ["fetchHotelByID", hotelId],
    () => apiClient.fetchHotelById(hotelId!),
    { enabled: !!hotelId }
  );

  const { data: currentUser } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser
  );

  const { data: paymentIntentData } = useQuery(
    ["createPaymentIntent", hotelId, numberOfNights],
    () =>
      apiClient.createPaymentIntent(
        hotelId!,
        numberOfNights.toString()
      ),
    { enabled: !!hotelId && numberOfNights > 0 }
  );

  if (!hotel || !currentUser || !paymentIntentData) return null;

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-4">
      <BookingDetailsSummary
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        adultCount={search.adultCount}
        childCount={search.childCount}
        numberOfNights={numberOfNights}
        hotel={hotel}
      />

      <Elements
        stripe={stripePromise}
        options={{ clientSecret: paymentIntentData.clientSecret }}
      >
        <BookingForm
          currentUser={currentUser}
          hotelId={hotel._id}
          paymentIntent={paymentIntentData}
        />
      </Elements>
    </div>
  );
};

export default Booking;