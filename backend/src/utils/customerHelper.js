import Customer from "../models/Customer.model.js";
import ApiError from "./ApiError.js";

export async function findOrCreateCustomer(pharmacyId, customerData, createdFrom = "reservation") {
  const fullName = customerData.fullName?.trim();
  const phone = customerData.phone?.trim() || "";
  const email = customerData.email?.trim().toLowerCase();

  let customer = await Customer.findOne({ pharmacyId, email });
  if (customer) {
    if (!customer.isActive) {
      throw ApiError.forbidden("This customer profile is deactivated and cannot submit new reservations");
    }

    customer.fullName = fullName;
    customer.phone = phone;
    await customer.save();
    return customer;
  }

  return Customer.create({
    pharmacyId,
    fullName,
    phone,
    email,
    createdFrom,
  });
}
