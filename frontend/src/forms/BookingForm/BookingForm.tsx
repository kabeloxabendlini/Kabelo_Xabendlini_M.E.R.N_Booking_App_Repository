import { useForm } from "react-hook-form";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";
import { useSearchContext } from "../../contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { useAppContext } from "../../contexts/AppContext";
import * as apiClient from "../../api-client";
import { PaymentIntentResponse, UserType } from "../../../../backend/src/shared/types";

type Props = {
  currentUser: UserType;
  hotelId: string;
  paymentIntent: PaymentIntentResponse;
};

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: string;
  checkOut: string;
  hotelId: string;
  paymentIntentId: string;
  totalCost: number;
};

const BookingForm = ({ currentUser, hotelId, paymentIntent }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const search = useSearchContext();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const queryClient = useQueryClient();

  const { handleSubmit } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      adultCount: search.adultCount,
      childCount: search.childCount,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      hotelId,
      totalCost: paymentIntent.totalCost,
      paymentIntentId: paymentIntent.paymentIntentId,
    },
  });

  const { mutate: bookRoom, isLoading } = useMutation(apiClient.createRoomBooking, {
    onError: () => {
      showToast({ message: "Failed to save booking", type: "ERROR" });
    },
    onSuccess: () => {
      showToast({ message: "Booking saved!", type: "SUCCESS" });
      navigate("/my-bookings");
    },
  });

  const onSubmit = async () => {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement) as StripeCardElement;

    const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
        },
      },
    });

    if (result.error) {
      showToast({ message: result.error.message || "Payment failed", type: "ERROR" });
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      const newBooking = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        adultCount: search.adultCount,
        childCount: search.childCount,
        checkIn: search.checkIn.toISOString(),
        checkOut: search.checkOut.toISOString(),
        hotelId,
        paymentIntentId: result.paymentIntent.id,
        totalCost: paymentIntent.totalCost,
        _id: result.paymentIntent.id, // temp id for optimistic UI
      };

      // Optimistic update: add booking to cache immediately
      queryClient.setQueryData<any>("fetchMyBookings", (old: any) =>
        old?.map((hotel: any) =>
          hotel._id === hotelId
            ? { ...hotel, bookings: [...hotel.bookings, newBooking] }
            : hotel
        )
      );

      // Persist booking to backend
      bookRoom(newBooking);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-5 rounded-lg border border-slate-300 p-5"
    >
      <span className="text-3xl font-bold">Confirm Your Details</span>

      <div className="grid grid-cols-2 gap-6">
        <input type="text" readOnly value={currentUser.firstName} className="border p-2 rounded w-full" />
        <input type="text" readOnly value={currentUser.lastName} className="border p-2 rounded w-full" />
        <input type="text" readOnly value={currentUser.email} className="border p-2 rounded w-full" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Total Cost</h2>
        <div className="bg-blue-200 p-4 rounded-md">
          £{paymentIntent.totalCost.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Payment Details</h3>
        <CardElement className="border rounded-md p-2 text-sm" />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 disabled:bg-gray-500"
        >
          {isLoading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;