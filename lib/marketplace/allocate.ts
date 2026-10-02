export type QueueFacility = {
  id: string;
  required: number;
  funded: number;
  priority: number;
};

export function allocateWaterfall(facilities: QueueFacility[], amount: number) {
  const ordered = [...facilities].sort((a, b) => a.priority - b.priority || a.required - b.required);
  let remaining = amount;
  const allocations: { facilityId: string; amount: number; fundedAfter: number; required: number }[] = [];

  for (const facility of ordered) {
    const room = Math.max(facility.required - facility.funded, 0);
    const take = Math.min(room, remaining);
    if (take > 0) {
      allocations.push({
        facilityId: facility.id,
        amount: take,
        fundedAfter: facility.funded + take,
        required: facility.required,
      });
      remaining -= take;
    }
    if (remaining <= 0) break;
  }

  return { allocations, unallocated: remaining };
}

export function poolAvailable(target: number, raised: number) {
  return Math.max(target - raised, 0);
}

export function assertCapacity(amount: number, available: number, minimum: number) {
  if (amount < minimum) return `Minimum investment is ${minimum}`;
  if (amount > available) return `Maximum available allocation is ${available}`;
  return null;
}
