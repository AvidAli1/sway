import mongoose from "mongoose"

const AddressSchema = new mongoose.Schema({
    label: { type: String, default: "Home" }, // e.g. Home, Work
    fullName: String,
    phone: String,
    street: String,
    apartment: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false },
  });


const Address = mongoose.models.Address || mongoose.model("Address", AddressSchema);

export default Address