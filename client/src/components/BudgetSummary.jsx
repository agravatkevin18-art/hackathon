import { calcBudget } from '../utils/budget';
import { formatINR } from '../utils/api';

export default function BudgetSummary({ design }) {
  const b = calcBudget(design);
  return (
    <div className="card budget">
      <h3>💰 Budget Summary</h3>
      <div className="row"><span>Furniture total</span><b>{formatINR(b.furnitureTotal)}</b></div>
      <div className="row"><span>Lighting total</span><b>{formatINR(b.lightingTotal)}</b></div>
      <div className="row"><span>Flooring price</span><b>{formatINR(b.flooringPrice)}</b></div>
      <hr />
      <div className="row total"><span>Estimated Budget</span><b>{formatINR(b.total)}</b></div>
    </div>
  );
}
