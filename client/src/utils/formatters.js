export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeOnly = (dateOrString) => {
  if (!dateOrString) return '';
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeWithSeconds = (dateOrString) => {
  if (!dateOrString) return '';
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Real-Time Dynamic Order Timings Engine
// Accurately tracks estimated arrival vs actual completion timestamps (early, on time, or delayed)
export const getRealTimeOrderTimings = (order, liveNow = new Date()) => {
  if (!order) return {};

  const orderCreated = order.createdAt ? new Date(order.createdAt) : liveNow;
  const isTodayOrder =
    liveNow.getTime() - orderCreated.getTime() < 12 * 60 * 60 * 1000 &&
    liveNow.getDate() === orderCreated.getDate();

  // Initial Target Delivery Time (defaults to 15 minutes from order placement)
  const initialEstDelivery = order.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime)
    : new Date(orderCreated.getTime() + 15 * 60000);

  // Helper to extract actual status timestamp from order status history or direct fields
  const findHistoryTime = (st) => {
    if (Array.isArray(order.statusHistory)) {
      const found = order.statusHistory.find((h) => h.status === st);
      if (found && found.updatedAt) return new Date(found.updatedAt);
    }
    return null;
  };

  // Step 1: Placed Time
  const placedTime = isTodayOrder ? orderCreated : new Date(liveNow.getTime() - 20 * 60000);

  // Step 2: Packed Time (Actual if completed, otherwise estimated)
  let packedTime;
  const hasReachedPacked =
    order.orderStatus === 'Packed' ||
    order.orderStatus === 'Out for Delivery' ||
    order.orderStatus === 'Delivered';

  if (order.packedAt) {
    packedTime = new Date(order.packedAt);
  } else if (findHistoryTime('Packed')) {
    packedTime = findHistoryTime('Packed');
  } else if (hasReachedPacked) {
    packedTime = new Date(placedTime.getTime() + 3 * 60000);
  } else {
    packedTime = new Date(placedTime.getTime() + 4 * 60000);
  }

  // Step 3: Out for Delivery Time (Actual if completed, otherwise estimated)
  let dispatchedTime;
  const hasReachedDispatched =
    order.orderStatus === 'Out for Delivery' || order.orderStatus === 'Delivered';

  if (order.outForDeliveryAt) {
    dispatchedTime = new Date(order.outForDeliveryAt);
  } else if (findHistoryTime('Out for Delivery')) {
    dispatchedTime = findHistoryTime('Out for Delivery');
  } else if (hasReachedDispatched) {
    dispatchedTime = new Date(placedTime.getTime() + 7 * 60000);
  } else {
    dispatchedTime = new Date(placedTime.getTime() + 8 * 60000);
  }

  // Step 4: Delivered Time (Actual if marked Delivered)
  const isDelivered = order.orderStatus === 'Delivered';
  let actualDeliveredTime = null;
  if (isDelivered) {
    if (order.deliveredAt) {
      actualDeliveredTime = new Date(order.deliveredAt);
    } else if (findHistoryTime('Delivered')) {
      actualDeliveredTime = findHistoryTime('Delivered');
    } else if (order.updatedAt) {
      actualDeliveredTime = new Date(order.updatedAt);
    } else {
      actualDeliveredTime = liveNow;
    }
  }

  // Comparison logic: Early vs Delayed vs On-Time
  let isEarly = false;
  let isLate = false;
  let isDelayed = false;
  let comparisonType = 'pending';
  let comparisonText = '';
  let bannerText = '';
  let delayNotice = '';
  let remainingMins = 0;
  let dynamicEstimatedArrival = initialEstDelivery;

  if (isDelivered) {
    // Order is finished! Compare actual delivery against original estimate
    const diffMins = Math.round((actualDeliveredTime.getTime() - initialEstDelivery.getTime()) / 60000);
    remainingMins = 0;

    if (diffMins <= -1) {
      // Completed BEFORE estimation!
      isEarly = true;
      comparisonType = 'early';
      const minsEarly = Math.abs(diffMins);
      comparisonText = `${minsEarly} min${minsEarly === 1 ? '' : 's'} ahead of estimation! ⚡`;
      bannerText = `Delivered Early! Completed at ${formatTimeOnly(actualDeliveredTime)} (${minsEarly} min${minsEarly === 1 ? '' : 's'} ahead of schedule)`;
    } else if (diffMins >= 1) {
      // Completed AFTER estimation!
      isLate = true;
      comparisonType = 'after';
      comparisonText = `${diffMins} min${diffMins === 1 ? '' : 's'} after estimated time`;
      bannerText = `Delivered at ${formatTimeOnly(actualDeliveredTime)} (${diffMins} min${diffMins === 1 ? '' : 's'} after original estimate)`;
    } else {
      // Completed right on time
      comparisonType = 'ontime';
      comparisonText = 'Right on schedule!';
      bannerText = `Delivered right on time at ${formatTimeOnly(actualDeliveredTime)}`;
    }
  } else {
    // Order is in progress: check if current live time has exceeded initial estimation
    const diffFromEstimate = Math.round((liveNow.getTime() - initialEstDelivery.getTime()) / 60000);

    if (diffFromEstimate > 0) {
      // Taking longer / running AFTER initial estimation: update dynamic ETA!
      isDelayed = true;
      comparisonType = 'delayed';
      const addMins = order.orderStatus === 'Out for Delivery' ? 3 : order.orderStatus === 'Packed' ? 6 : 10;
      remainingMins = addMins;
      dynamicEstimatedArrival = new Date(liveNow.getTime() + addMins * 60000);
      delayNotice = `${diffFromEstimate} min${diffFromEstimate === 1 ? '' : 's'} past initial estimate`;
      bannerText = `Updated Real-Time ETA: ~${formatTimeOnly(dynamicEstimatedArrival)} (${remainingMins} mins remaining • delayed past initial estimate)`;
    } else {
      // On track: within original estimate
      isDelayed = false;
      comparisonType = 'ontrack';
      remainingMins = Math.max(1, Math.abs(diffFromEstimate));
      dynamicEstimatedArrival = initialEstDelivery;
      bannerText = `Estimated Arrival: ~${formatTimeOnly(initialEstDelivery)} (${remainingMins} mins remaining)`;
    }
  }

  let statusText = 'Processing';
  if (order.orderStatus === 'Pending') {
    statusText = 'Order received at grocery store hub. Bagging scheduled soon.';
  } else if (order.orderStatus === 'Packed') {
    statusText = 'Items sealed & verified. Delivery partner assigned for pickup.';
  } else if (order.orderStatus === 'Out for Delivery') {
    statusText = 'Partner on EV Scooter riding towards your doorstep. Arriving shortly!';
  } else if (order.orderStatus === 'Delivered') {
    statusText = bannerText || 'Package successfully handed over at your doorstep.';
  }

  return {
    placed: formatTimeOnly(placedTime),
    packed: formatTimeOnly(packedTime),
    dispatched: formatTimeOnly(dispatchedTime),
    delivered: formatTimeOnly(actualDeliveredTime || initialEstDelivery),
    actualDeliveredTime: actualDeliveredTime ? formatTimeOnly(actualDeliveredTime) : null,
    initialEstDelivery: formatTimeOnly(initialEstDelivery),
    estimatedArrival: formatTimeOnly(dynamicEstimatedArrival),
    remainingMins,
    statusText,
    isDelivered,
    isEarly,
    isLate,
    isDelayed,
    comparisonType,
    comparisonText,
    bannerText,
    delayNotice,
    liveClock: formatTimeWithSeconds(liveNow),
  };
};

// Backward compatibility alias
export const getOrderTimings = (order) => getRealTimeOrderTimings(order, new Date());

export const getStatusConfig = (status) => {
  switch (status) {
    case 'Pending':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        icon: 'Clock',
        step: 0,
      };
    case 'Packed':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        icon: 'Package',
        step: 1,
      };
    case 'Out for Delivery':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        icon: 'Truck',
        step: 2,
      };
    case 'Delivered':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        icon: 'CheckCircle2',
        step: 3,
      };
    case 'Cancelled':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        icon: 'XCircle',
        step: -1,
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
        icon: 'HelpCircle',
        step: 0,
      };
  }
};
