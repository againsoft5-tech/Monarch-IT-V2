/**
 * Google Maps destinations for the Monarch IT premises, shared by the Contact Us
 * and Outlets pages so the two never drift apart.
 *
 * `headOffice` is the Monarch IT Limited listing itself; the RMA counter is two
 * floors up in the same building, so it points at the same pin. No listing exists
 * for the IDB shop, so that one is a maps search for the arcade it sits in.
 */
export const MAPS = {
  headOffice: 'https://maps.app.goo.gl/EhQKRsHHjLbktEWm9',
  idb: 'https://www.google.com/maps/search/?api=1&query=BCS+Computer+City%2C+IDB+Bhaban%2C+Agargaon%2C+Dhaka-1207',
} as const
