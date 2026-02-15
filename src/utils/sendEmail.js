import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const data = await resend.emails.send({
            from: 'Sway <onboarding@resend.dev>', // Update this with your verified domain
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

const getCommonStyle = () => `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #000000;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
`;

const getHeader = () => `
  <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
    <div style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 2px; margin: 0; font-family: Arial, sans-serif;">
      SW<span style="color: #facc15;">A</span>Y
    </div>
  </div>
`;

const getFooter = () => `
  <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; margin-top: 30px; font-size: 12px; color: #666666;">
    <p>&copy; ${new Date().getFullYear()} Sway. All rights reserved.</p>
    <p>Discover Fashion Through Swipe</p>
  </div>
`;

const getOrderItemsList = (items, currency) => {
    if (!items || items.length === 0) return '';

    const itemsHtml = items.map(item => `
    <div style="border-bottom: 1px solid #eeeeee; padding: 10px 0; display: flex; justify-content: space-between;">
      <div style="flex: 1; padding-right: 10px;">
        <span style="font-weight: bold; display: block;">${item.productSnapshot?.name || 'Product'}</span>
        <span style="font-size: 14px; color: #666;">Qty: ${item.quantity}</span>
      </div>
      <div style="font-weight: bold; white-space: nowrap;">
        ${currency} ${item.price}
      </div>
    </div>
  `).join('');

    return `
    <div style="margin-top: 20px;">
      <h3 style="border-bottom: 2px solid #facc15; display: inline-block; padding-bottom: 5px; margin-bottom: 15px;">Order Items</h3>
      ${itemsHtml}
    </div>
  `;
};

export const getOrderConfirmedTemplate = (order, customerName) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="${getCommonStyle()}">
        ${getHeader()}
        
        <div style="padding: 30px;">
          <h1 style="color: #000000; margin-bottom: 20px; font-size: 24px;">Order Confirmed!</h1>
          
          <p>Hi ${customerName},</p>
          <p>Thank you for your order! We are pleased to confirm that your order has been received and is being processed by the brand.</p>
          
          <div style="background-color: #fffbeb; border: 1px solid #facc15; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Order Number:</span>
              <span style="font-weight: bold;">${order.orderNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Total Amount:</span>
              <span style="font-weight: bold;">${order.currency} ${order.total}</span>
            </div>
          </div>

          ${getOrderItemsList(order.items, order.currency)}

          <p style="margin-top: 30px;">We'll send you another email when your items are shipped.</p>
        </div>

        ${getFooter()}
      </div>
    </body>
    </html>
  `;
};

export const getOutForDeliveryTemplate = (order, customerName) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="${getCommonStyle()}">
        ${getHeader()}
        
        <div style="padding: 30px;">
          <h1 style="color: #000000; margin-bottom: 20px; font-size: 24px;">Out for Delivery!</h1>
          
          <p>Hi ${customerName},</p>
          <p>Great news! Your order is on its way to your doorstep.</p>
          
          <div style="background-color: #fffbeb; border: 1px solid #facc15; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 18px;">Delivery Details</h3>
            
            <div style="margin-bottom: 10px;">
              <span style="color: #666; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</span>
              <span style="font-weight: bold; font-size: 16px;">${order.orderNumber}</span>
            </div>

            ${order.delivery.trackingNumber ? `
            <div style="margin-bottom: 10px;">
              <span style="color: #666; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Number</span>
              <span style="font-weight: bold; font-size: 16px;">${order.delivery.trackingNumber}</span>
            </div>
            ` : ''}

            ${order.delivery.courierService ? `
            <div style="margin-bottom: 10px;">
              <span style="color: #666; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Courier Service</span>
              <span style="font-weight: bold; font-size: 16px;">${order.delivery.courierService}</span>
            </div>
            ` : ''}



            ${order.delivery.estimatedDelivery ? `
            <div style="margin-bottom: 10px;">
              <span style="color: #666; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</span>
              <span style="font-weight: bold; font-size: 16px;">${new Date(order.delivery.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            ` : ''}

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #facc15;">
               <span style="color: #666; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</span>
               <div style="font-weight: 500; margin-top: 5px;">
                 ${order.shippingAddress?.address}, ${order.shippingAddress?.city}<br>
                 ${order.shippingAddress?.state}, ${order.shippingAddress?.country}
                 ${order.shippingAddress?.postalCode ? ` - ${order.shippingAddress.postalCode}` : ''}
               </div>
            </div>
          </div>

          <p>Please ensure someone is available to receive the package.</p>
          <p>Thank you for shopping with Sway!</p>
        </div>

        ${getFooter()}
      </div>
    </body>
    </html>
  `;
};
