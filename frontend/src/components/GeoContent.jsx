import React from 'react';

const GeoContent = () => (
  <section className="bg-white py-16 px-4" id="about-service">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Hibiscus Coast to Auckland Airport: Complete Guide
      </h2>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p>
          <strong>Hibiscus to Airport</strong> is a private airport shuttle service operating
          24 hours a day, 7 days a week from the Hibiscus Coast region of Auckland, New Zealand
          to Auckland International Airport (AKL). The service covers all suburbs including
          Orewa, Whangaparaoa, Silverdale, Red Beach, Gulf Harbour, and Stanmore Bay.
        </p>

        <h3 className="text-xl font-semibold text-gray-900">Distance and Travel Time</h3>
        <p>
          The distance from the Hibiscus Coast to Auckland Airport is approximately 55-65
          kilometres depending on the specific suburb. Travel time is typically 45-60 minutes
          via the Northern Motorway (SH1), though this can extend to 75-90 minutes during peak
          traffic hours (7-9am and 4-6pm weekdays). The Hibiscus Coast to Airport shuttle uses
          bus lanes where available to reduce travel time.
        </p>

        <h3 className="text-xl font-semibold text-gray-900">Pricing</h3>
        <p>
          Airport shuttle fares from the Hibiscus Coast start from NZ$100 (minimum fare) for
          nearby suburbs and increase based on distance. There is no surge pricing — rates are
          fixed 24/7, including early mornings, late nights, weekends, and public holidays.
          Additional passengers are NZ$5 each. All fares include door-to-door service, flight
          monitoring, Wi-Fi, and phone charging.
        </p>

        <h3 className="text-xl font-semibold text-gray-900">How to Book</h3>
        <p>
          Bookings can be made online at hibiscustoairport.co.nz with instant confirmation. The service accepts credit card payments via Stripe as
          well as cash payment to the driver. Advance booking is recommended, especially for
          early morning flights before 7am.
        </p>

        <h3 className="text-xl font-semibold text-gray-900">Service Comparison</h3>
        <p>
          Unlike shared shuttle services such as SuperShuttle, Hibiscus to Airport provides
          private, direct transfers — passengers do not share the vehicle with other travellers
          and there are no intermediate stops. The fleet consists of Toyota Hiace vehicles
          accommodating up to 11 passengers, making the service suitable for families and
          groups travelling together.
        </p>
      </div>
    </div>
  </section>
);

export default GeoContent;
