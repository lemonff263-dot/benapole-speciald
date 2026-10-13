import { Order, RestaurantSettings } from './types';

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!token || !chatId) {
    return { success: false, error: 'Telegram Bot Token or Chat ID is not configured.' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      return {
        success: false,
        error: data.description || 'Telegram API returned an error.',
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
    console.error('Failed to dispatch Telegram message:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

export function formatNewOrderMessage(order: Order, settings: RestaurantSettings): string {
  const modeText = order.orderMode === 'delivery' ? '🛵 হোম ডেলিভারি (Home Delivery)' : '🛍️ পিকআপ (Pickup)';
  const payMethodText =
    order.paymentMethod === 'cod'
      ? 'ক্যাশ অন ডেলিভারি (COD)'
      : order.paymentMethod === 'pickup_cash'
      ? 'পিকআপে ক্যাশ (Pay at Pickup)'
      : order.paymentMethod === 'bkash'
      ? `বিকাশ ম্যানুয়াল (bKash) | TrxID: ${order.transactionId || 'দেওয়া হয়নি'}`
      : order.paymentMethod === 'nagad'
      ? `নগদ ম্যানুয়াল (Nagad) | TrxID: ${order.transactionId || 'দেওয়া হয়নি'}`
      : `রকেট ম্যানুয়াল (Rocket) | TrxID: ${order.transactionId || 'দেওয়া হয়নি'}`;

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${item.name.bn} / ${item.name.en}</b>` +
        (item.variantName ? ` (${item.variantName.bn})` : '') +
        (item.selectedAddOns && item.selectedAddOns.length > 0
          ? ` + [${item.selectedAddOns.map((a) => a.name.bn).join(', ')}]`
          : '') +
        ` × ${item.quantity} = ৳${item.totalPrice}`
    )
    .join('\n');

  return `🔔 <b>নতুন অর্ডার এসেছে! New Order Received</b>
━━━━━━━━━━━━━━━━━━
<b>অর্ডার আইডি:</b> <code>${order.id}</code>
<b>তারিখ ও সময়:</b> ${new Date(order.createdAt).toLocaleString('bn-BD')}

👤 <b>গ্রাহক:</b> ${order.customerName}
📞 <b>মোবাইল:</b> ${order.customerPhone}
📍 <b>অর্ডার মোড:</b> ${modeText}
${order.address ? `🏠 <b>ঠিকানা:</b> ${order.address}\n📌 <b>এলাকা:</b> ${order.area || 'বেনাপোল'}\n` : ''}${order.landmark ? `🏛️ <b>কাছের ল্যান্ডমার্ক:</b> ${order.landmark}\n` : ''}${order.googleMapsUrl ? `🗺️ <b>ম্যাপ লোকেশন:</b> <a href="${order.googleMapsUrl}">গুগল ম্যাপে দেখুন</a>\n` : ''}${order.pickupTime ? `⏰ <b>পিকআপ সময়:</b> ${order.pickupTime}\n` : ''}${order.instructions ? `📝 <b>বিশেষ নোট:</b> ${order.instructions}\n` : ''}
🍲 <b>অর্ডারকৃত খাবার:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
💰 সাবটোটাল: ৳${order.subtotal}
${order.discount > 0 ? `🏷️ ডিসকাউন্ট (${order.couponCode || 'কুপন'}): -৳${order.discount}\n` : ''}🛵 ডেলিভারি চার্জ: ৳${order.deliveryFee}
💵 <b>সর্বমোট বিল: ৳${order.total}</b>
💳 <b>পেমেন্ট মাধ্যম:</b> ${payMethodText}
📊 <b>পেমেন্ট স্ট্যাটাস:</b> ${order.paymentStatus}
━━━━━━━━━━━━━━━━━━
<i>বেনাপোল স্পেশাল কিচেন ম্যানেজমেন্ট</i>`;
}

export function formatStatusUpdateMessage(order: Order, newStatus: string): string {
  const statusLabels: Record<string, string> = {
    received: 'গ্রহণ করা হয়েছে (Order Received)',
    confirmed: 'নিশ্চিত করা হয়েছে (Confirmed)',
    preparing: 'প্রস্তুত করা হচ্ছে (Kitchen Preparing)',
    ready_or_out:
      order.orderMode === 'delivery'
        ? 'ডেলিভারির জন্য বের হয়েছে (Out for Delivery)'
        : 'পিকআপের জন্য প্রস্তুত (Ready for Pickup)',
    completed: 'ডেলিভারি সম্পন্ন (Completed/Delivered)',
    cancelled: 'অর্ডার বাতিল করা হয়েছে (Cancelled)',
  };

  return `📢 <b>অর্ডার স্ট্যাটাস আপডেট!</b>
━━━━━━━━━━━━━━━━━━
<b>অর্ডার আইডি:</b> <code>${order.id}</code>
<b>গ্রাহক:</b> ${order.customerName} (${order.customerPhone})
<b>বর্তমান স্ট্যাটাস:</b> <b>${statusLabels[newStatus] || newStatus}</b>
<b>মোট বিল:</b> ৳${order.total} (${order.paymentMethod.toUpperCase()})
━━━━━━━━━━━━━━━━━━`;
}

export function formatRestaurantToggleMessage(isAccepting: boolean): string {
  return `🏪 <b>রেস্টুরেন্ট অর্ডার সার্ভিস আপডেট</b>
━━━━━━━━━━━━━━━━━━
<b>স্ট্যাটাস:</b> ${isAccepting ? '✅ অর্ডার গ্রহণ চালু (ON)' : '🛑 অর্ডার গ্রহণ সাময়িক বন্ধ (OFF)'}
<b>সময়:</b> ${new Date().toLocaleString('bn-BD')}
━━━━━━━━━━━━━━━━━━
<i>বেনাপোল স্পেশাল কিচেন ম্যানেজমেন্ট</i>`;
}

export function formatScheduleUpdateMessage(summary: string): string {
  return `⏰ <b>সাপ্তাহিক সময়সূচি আপডেট করা হয়েছে!</b>
━━━━━━━━━━━━━━━━━━
${summary}
<b>সময়:</b> ${new Date().toLocaleString('bn-BD')}
━━━━━━━━━━━━━━━━━━
<i>বেনাপোল স্পেশাল অ্যাডমিন</i>`;
}

