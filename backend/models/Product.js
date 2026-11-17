
import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  product_name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  current_stock: { type: Number, required: true, min: 0 },
  units_sold: { type: Number, required: true, min: 0 },
  observation_period_days: { type: Number, required: true, min: 1 },
  lead_time_days: { type: Number, required: true, min: 0 },
  safety_stock: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'pieces' },
  target_stock: { type: Number, required: true, min: 0 },
  mode: { type: String, enum: ['store'], required: true, index: true },
  reviewed: { type: Boolean, default: false }
}, { timestamps: true });
productSchema.index({ mode: 1, productId: 1 }, { unique: true });
export const toClient = (doc) => { const o = doc.toObject ? doc.toObject() : doc; return { id: o.productId, product_name:o.product_name, category:o.category, current_stock:o.current_stock, units_sold:o.units_sold, observation_period_days:o.observation_period_days, lead_time_days:o.lead_time_days, safety_stock:o.safety_stock, unit:o.unit, target_stock:o.target_stock, mode:o.mode, reviewed:!!o.reviewed }; };
export default mongoose.model('Product', productSchema);
