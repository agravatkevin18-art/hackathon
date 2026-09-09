export function calcBudget(design, flooringList = []) {
  const furnitureTotal = (design.furniture || []).reduce((s, f) => s + (f.price || 0), 0);
  const lightingTotal = (design.lighting || []).reduce((s, l) => s + (l.price || 0), 0);
  let flooringPrice = 0;
  if (design.flooring) {
    const area = Number(design.length || 0) * Number(design.width || 0);
    const perSq = design.flooring.pricePerSqFt || 0;
    flooringPrice = Math.round(area * perSq);
  }
  return { furnitureTotal, lightingTotal, flooringPrice, total: furnitureTotal + lightingTotal + flooringPrice };
}

export function areaOf(design) {
  return (Number(design.length) || 0) * (Number(design.width) || 0);
}
