// ---------------------------------------------------------------------------
// The only file you should ever need to edit.
//
// Paths are the part of the address after "seller.walmart.com".
// Each blocked path also blocks everything under it:
//   "/payments" blocks /payments, /payments/statements, /payments/anything...
// After editing, click the reload arrow on the extension in chrome://extensions.
// ---------------------------------------------------------------------------

var FULFILLMENT_MODE_CONFIG = {
  // Where employees are sent if they open a blocked page.
  redirectTo: "https://seller.walmart.com/orders/manage-orders",

  // Pages employees should never see. Links to them are also removed from
  // menus and from the homepage (that is what removes the Current Balance tile).
  blockedPaths: [
    "/payments",                    // Payments (sidebar)
    "/payment",                     // older Payments links
    "/partner-analytics/payments",  // Current Balance tile on the homepage
    "/analytics"                    // Analytics (sidebar)
  ],

  // The homepage stays, minus these.
  homepagePath: "/home",
  homepage: {
    hideGmvGraph: true,     // the GMV total and sales chart
    maskDollarAmounts: true // every $ amount on the homepage shows as $•••
  }
};
