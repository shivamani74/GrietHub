import React from "react";
import { useParams } from "react-router-dom";
import EventDetails from "./EventDetails";


const EventPayment = () => {
  const { eventId } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h2>💳 Event Registration Payment</h2>

      
      <EventDetails isPaymentPage={true} eventId={eventId} />
    </div>
  );
};

export default EventPayment;
